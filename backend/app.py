import os
import re
import jwt
import datetime
import requests
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_mail import Mail, Message
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from urllib.parse import urlparse

# ─── App Init ────────────────────────────────────────────────────────────────

app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ─── Configuration ───────────────────────────────────────────────────────────

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change-me-in-production").strip()
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///cybersense.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", "587"))
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME", "").strip() or None
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD", "").strip() or None
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER", "").strip() or None

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()

# ─── CORS ────────────────────────────────────────────────────────────────────

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# ─── Extensions ──────────────────────────────────────────────────────────────

db     = SQLAlchemy(app)
bcrypt = Bcrypt(app)
mail   = Mail(app)

# Rate Limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# ─── Security Headers Middleware ────────────────────────────────────────────

@app.after_request
def add_security_headers(response):
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    return response

# ─── Model ───────────────────────────────────────────────────────────────────

class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    google_id     = db.Column(db.String(150), nullable=True)
    avatar        = db.Column(db.String(255), nullable=True)
    role          = db.Column(db.String(20), default="user", nullable=False)
    is_active     = db.Column(db.Boolean, default=True, nullable=False)
    last_login    = db.Column(db.DateTime, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "avatar":     self.avatar or f"https://api.dicebear.com/7.x/bottts/svg?seed={self.email}",
            "role":       self.role,
            "is_active":  self.is_active,
            "last_login": self.last_login.strftime("%Y-%m-%d %H:%M:%S") if self.last_login else None,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
        }


class SecurityScore(db.Model):
    __tablename__ = "security_scores"

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    score           = db.Column(db.Integer, default=0)
    security_level  = db.Column(db.String(20), default="Low")
    risk_score      = db.Column(db.Integer, default=100)
    password_strength = db.Column(db.String(20), default="Weak")
    last_updated    = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    activity    = db.Column(db.String(100), nullable=False)
    icon        = db.Column(db.String(50), default="CheckCircle")
    color       = db.Column(db.String(20), default="text-emerald-400")
    ip_address  = db.Column(db.String(45), nullable=True)
    user_agent  = db.Column(db.String(255), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class Achievement(db.Model):
    __tablename__ = "achievements"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    badge_name  = db.Column(db.String(50), nullable=False)
    icon        = db.Column(db.String(50), nullable=False)
    unlocked    = db.Column(db.Boolean, default=False)
    unlocked_at = db.Column(db.DateTime, nullable=True)


class NotificationSetting(db.Model):
    __tablename__ = "notification_settings"

    id                  = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id             = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    security_alerts     = db.Column(db.Boolean, default=True)
    phishing_alerts     = db.Column(db.Boolean, default=True)
    password_expiry     = db.Column(db.Boolean, default=True)
    account_activity    = db.Column(db.Boolean, default=True)
    ai_notifications    = db.Column(db.Boolean, default=True)
    email_notifications  = db.Column(db.Boolean, default=True)
    marketing_emails    = db.Column(db.Boolean, default=False)
    account_visibility  = db.Column(db.Boolean, default=True)
    anonymous_analytics = db.Column(db.Boolean, default=True)


class PrivacySetting(db.Model):
    __tablename__ = "privacy_settings"

    id                  = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id             = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    theme               = db.Column(db.String(20), default="dark")
    ai_recommendations  = db.Column(db.Boolean, default=True)


class RiskTrend(db.Model):
    __tablename__ = "risk_trends"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    week_number = db.Column(db.Integer, nullable=False)
    score       = db.Column(db.Integer, default=100)
    created_at  = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class ScanResult(db.Model):
    __tablename__ = "scan_results"

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    module          = db.Column(db.String(30), nullable=False)
    input_summary   = db.Column(db.String(255), nullable=False)
    risk_score      = db.Column(db.Integer, nullable=False)
    threat_level    = db.Column(db.String(20), nullable=False)
    verdict         = db.Column(db.String(30), nullable=False)
    explanation     = db.Column(db.Text, nullable=False)
    factors         = db.Column(db.JSON, nullable=False)
    coaching        = db.Column(db.Text, nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "module": self.module,
            "inputSummary": self.input_summary,
            "riskScore": self.risk_score,
            "threatLevel": self.threat_level,
            "verdict": self.verdict,
            "explanation": self.explanation,
            "factors": self.factors or [],
            "coaching": self.coaching,
            "createdAt": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
        }


# ─── Admin Models ───────────────────────────────────────────────────────────────

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    action      = db.Column(db.String(100), nullable=False)
    target_type = db.Column(db.String(50), nullable=True)
    target_id   = db.Column(db.Integer, nullable=True)
    details     = db.Column(db.Text, nullable=True)
    ip_address  = db.Column(db.String(45), nullable=True)
    user_agent  = db.Column(db.String(255), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "adminId": self.admin_id,
            "action": self.action,
            "targetType": self.target_type,
            "targetId": self.target_id,
            "details": self.details,
            "ipAddress": self.ip_address,
            "userAgent": self.user_agent,
            "createdAt": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
        }


class SystemLog(db.Model):
    __tablename__ = "system_logs"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    level       = db.Column(db.String(20), nullable=False)
    module      = db.Column(db.String(50), nullable=True)
    message     = db.Column(db.Text, nullable=False)
    details     = db.Column(db.Text, nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "level": self.level,
            "module": self.module,
            "message": self.message,
            "details": self.details,
            "createdAt": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
        }


class Feedback(db.Model):
    __tablename__ = "feedback"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    name        = db.Column(db.String(100), nullable=True)
    email       = db.Column(db.String(120), nullable=True)
    subject     = db.Column(db.String(200), nullable=False)
    message     = db.Column(db.Text, nullable=False)
    is_read     = db.Column(db.Boolean, default=False)
    is_archived = db.Column(db.Boolean, default=False)
    created_at  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "isRead": self.is_read,
            "isArchived": self.is_archived,
            "createdAt": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
        }


class SystemSetting(db.Model):
    __tablename__ = "system_settings"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key         = db.Column(db.String(100), unique=True, nullable=False)
    value       = db.Column(db.Text, nullable=True)
    category    = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    updated_at  = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value,
            "category": self.category,
            "description": self.description,
            "updatedAt": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None,
        }


class AIModel(db.Model):
    __tablename__ = "ai_models"

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name            = db.Column(db.String(100), nullable=False)
    module          = db.Column(db.String(50), nullable=False)
    version         = db.Column(db.String(50), nullable=True)
    is_enabled      = db.Column(db.Boolean, default=True)
    accuracy        = db.Column(db.Float, nullable=True)
    predictions_count = db.Column(db.Integer, default=0)
    last_updated    = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    error_logs      = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "module": self.module,
            "version": self.version,
            "isEnabled": self.is_enabled,
            "accuracy": self.accuracy,
            "predictionsCount": self.predictions_count,
            "lastUpdated": self.last_updated.strftime("%Y-%m-%d %H:%M:%S") if self.last_updated else None,
            "errorLogs": self.error_logs,
        }


class AdminNotification(db.Model):
    __tablename__ = "admin_notifications"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type        = db.Column(db.String(50), nullable=False)
    title       = db.Column(db.String(200), nullable=False)
    message     = db.Column(db.Text, nullable=False)
    is_read     = db.Column(db.Boolean, default=False)
    priority    = db.Column(db.String(20), default="medium")
    created_at  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "isRead": self.is_read,
            "priority": self.priority,
            "createdAt": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
        }


# ─── Validation Helpers ──────────────────────────────────────────────────────

EMAIL_RE    = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
NAME_RE     = re.compile(r"^[A-Za-z ]+$")
PASSWORD_RE = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'\",.<>/?\\|`~]).{8,50}$"
)


def validate_name(name: str):
    name = name.strip()
    if not name:
        return "Full name is required."
    if len(name) < 3:
        return "Full name must be at least 3 characters."
    if len(name) > 100:
        return "Full name must be at most 100 characters."
    if not NAME_RE.match(name):
        return "Full name can only contain letters and spaces."
    return None


def validate_email(email: str):
    email = email.strip().lower()
    if not email:
        return "Email address is required."
    if not EMAIL_RE.match(email):
        return "Please enter a valid email address."
    return None


def validate_password(password: str):
    if not password:
        return "Password is required."
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if len(password) > 50:
        return "Password must be at most 50 characters."
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return "Password must contain at least one number."
    if not re.search(r"[!@#$%^&*()\-_=+\[\]{};:'\",.<>/?\\|`~]", password):
        return "Password must contain at least one special character."
    return None

# ─── JWT Helpers ─────────────────────────────────────────────────────────────

def generate_token(user_id, email, role="user", expires_in_hours=24):
    payload = {
        "user_id": user_id,
        "email":   email,
        "role":    role,
        "exp":     datetime.datetime.utcnow() + datetime.timedelta(hours=expires_in_hours),
        "iat":     datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def generate_reset_token(user_id, email):
    payload = {
        "user_id": user_id,
        "email":   email,
        "type":    "reset",
        "exp":     datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        "iat":     datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token):
    try:
        return jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def get_authenticated_user():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, (jsonify({"message": "Authorization token required."}), 401)

    token = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return None, (jsonify({"message": "Session expired or invalid token."}), 401)

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return None, (jsonify({"message": "User not found."}), 404)

    if not user.is_active:
        return None, (jsonify({"message": "Account is suspended."}), 403)

    return user, None


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user, error = get_authenticated_user()
        if error:
            return error

        if user.role != "admin":
            return jsonify({"message": "Admin access required."}), 403

        return f(user, *args, **kwargs)
    return decorated_function


def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user, error = get_authenticated_user()
            if error:
                return error

            if user.role not in allowed_roles:
                return jsonify({"message": "Insufficient permissions."}), 403

            return f(user, *args, **kwargs)
        return decorated_function
    return decorator


def classify_score(score):
    if score >= 80:
        return "HIGH", "Unsafe"
    if score >= 45:
        return "MEDIUM", "Suspicious"
    return "LOW", "Safe"


def summarize_input(value, max_len=180):
    normalized = " ".join(value.split())
    return normalized[:max_len] + ("..." if len(normalized) > max_len else "")


def build_analysis(module, content):
    text = content.strip()
    lowered = text.lower()
    factors = []
    score = 5

    if module == "sms":
        checks = [
            ("Urgency language", ["urgent", "immediately", "limited time", "act now"], 20),
            ("Credential or identity request", ["verify", "password", "otp", "pin", "account"], 25),
            ("Financial lure", ["bank", "card", "payment", "refund", "prize"], 20),
            ("Embedded link", ["http://", "https://", "bit.ly", "tinyurl"], 25),
            ("Threatening wording", ["blocked", "suspended", "locked"], 15),
        ]
        safe_summary = "SMS content does not match common smishing indicators."
    elif module == "email":
        checks = [
            ("Credential harvesting language", ["password", "verify", "login", "account locked"], 25),
            ("Call-to-action pressure", ["click here", "urgent", "immediately", "final notice"], 20),
            ("Attachment or payment lure", ["invoice", "payment", "wire", "refund"], 15),
            ("Suspicious link", ["http://", "https://", "bit.ly", "tinyurl"], 20),
            ("Brand impersonation cue", ["security team", "support desk", "administrator"], 10),
        ]
        safe_summary = "Email content does not match common phishing indicators."
    elif module == "url":
        parsed = urlparse(text if "://" in text else f"https://{text}")
        host = parsed.netloc.lower()
        checks = [
            ("Login lure in URL", ["login", "signin", "verify", "secure"], 25),
            ("Financial target keyword", ["bank", "paypal", "wallet", "payment"], 20),
            ("Suspicious TLD or lure", [".xyz", ".top", ".click", "free-gift"], 25),
            ("IP-address host", [], 20 if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", host) else 0),
            ("Long or complex URL", [], 15 if len(text) > 90 else 0),
        ]
        safe_summary = "URL does not match the configured suspicious URL indicators."
    else:
        raise ValueError("Unsupported scan module.")

    for label, keywords, weight in checks:
        matched = bool(weight and not keywords)
        if keywords:
            matched = any(keyword in lowered for keyword in keywords)
        if matched:
            score += weight
            factors.append({"label": label, "weight": weight})

    score = min(score, 100)
    threat_level, verdict = classify_score(score)
    if factors:
        explanation = "Risk score increased because the input matched: " + ", ".join(f["label"] for f in factors) + "."
    else:
        explanation = safe_summary

    coaching = (
        "Do not click links or share credentials until you verify the sender through a trusted channel."
        if score >= 45
        else "No major indicators were found, but continue verifying sender identity and link destinations."
    )

    return {
        "module": module,
        "riskScore": score,
        "threatLevel": threat_level,
        "verdict": verdict,
        "explanation": explanation,
        "factors": factors,
        "coaching": coaching,
        "inputSummary": summarize_input(text),
    }


def record_activity(user, activity, icon="CheckCircle", color="text-emerald-400"):
    entry = ActivityLog(
        user_id=user.id,
        activity=activity,
        icon=icon,
        color=color,
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(entry)
    db.session.commit()


def build_security_summary(user):
    has_password = bool(user.password_hash)
    has_google = bool(user.google_id)
    scan_count = ScanResult.query.filter_by(user_id=user.id).count()

    score = 60
    if has_password:
        score += 12
    if has_google:
        score += 8
    score += min(20, scan_count * 2)
    security_score = min(100, score)

    if security_score >= 85:
        security_level = "High"
    elif security_score >= 65:
        security_level = "Medium"
    else:
        security_level = "Low"

    risk_score = max(0, 100 - security_score)
    password_strength = "Strong" if has_password else "Needs setup"
    last_login_entry = ActivityLog.query.filter_by(user_id=user.id).order_by(ActivityLog.created_at.desc()).first()
    last_login = (
        last_login_entry.created_at.strftime("%Y-%m-%d %H:%M:%S")
        if last_login_entry and last_login_entry.created_at
        else (user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))
    )

    return {
        "securityScore": security_score,
        "securityLevel": security_level,
        "riskScore": risk_score,
        "passwordStrength": password_strength,
        "googleConnected": has_google,
        "lastPasswordChanged": user.created_at.strftime("%Y-%m-%d") if user.created_at else None,
        "lastLogin": last_login,
        "accountStatus": "Active",
    }


def create_scan_result(user, module, content):
    if not content or not content.strip():
        return None, (jsonify({"message": "Input content is required.", "field": "content"}), 400)
    if len(content) > 5000:
        return None, (jsonify({"message": "Input content must be 5000 characters or fewer.", "field": "content"}), 400)

    analysis = build_analysis(module, content)
    result = ScanResult(
        user_id=user.id,
        module=module,
        input_summary=analysis["inputSummary"],
        risk_score=analysis["riskScore"],
        threat_level=analysis["threatLevel"],
        verdict=analysis["verdict"],
        explanation=analysis["explanation"],
        factors=analysis["factors"],
        coaching=analysis["coaching"],
    )
    db.session.add(result)
    db.session.commit()
    record_activity(user, f"{module.upper()} scan completed", icon="ShieldCheck", color="text-cyan-400")

    response = result.to_dict()
    response["workflow"] = {
        "preprocessing": "Normalized whitespace and lowercased text for indicator matching.",
        "featureExtraction": "Extracted phishing keywords, link indicators, urgency cues, and module-specific risk factors.",
        "prediction": "Deterministic heuristic scorer. Replace this layer with the trained ML model when available.",
        "behaviorAnalysis": "Saved result contributes to user scan history and future behavioral risk scoring.",
        "explainableAI": analysis["factors"],
        "aiCoaching": analysis["coaching"],
        "savedResult": True,
    }
    return response, None

# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.route("/api/auth/register", methods=["POST"])
def register():
    data     = request.get_json() or {}
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Validate name
    name_err = validate_name(name)
    if name_err:
        return jsonify({"message": name_err, "field": "name"}), 400

    # Validate email
    email_err = validate_email(email)
    if email_err:
        return jsonify({"message": email_err, "field": "email"}), 400

    # Validate password
    pw_err = validate_password(password)
    if pw_err:
        return jsonify({"message": pw_err, "field": "password"}), 400

    # Duplicate email check
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "This email address is already registered. Please login.", "field": "email"}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user  = User(
        name          = name,
        email         = email,
        password_hash = hashed_pw,
        avatar        = f"https://api.dicebear.com/7.x/bottts/svg?seed={email}",
    )
    db.session.add(new_user)
    db.session.commit()
    record_activity(new_user, "Account created", icon="CheckCircle", color="text-emerald-400")

    token = generate_token(new_user.id, new_user.email, new_user.role)
    return jsonify({
        "message": "Registration successful.",
        "token":   token,
        "user":    new_user.to_dict(),
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json() or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email:
        return jsonify({"message": "Email address is required.", "field": "email"}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"message": "Please enter a valid email address.", "field": "email"}), 400
    if not password:
        return jsonify({"message": "Password is required.", "field": "password"}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters.", "field": "password"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Account not found. Please check your email or register."}), 404
    
    if not user.password_hash:
        return jsonify({"message": "This account uses Google authentication. Please sign in with Google."}), 400
    
    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password."}), 401

    if not user.is_active:
        return jsonify({"message": "Account is suspended. Please contact support."}), 403

    user.last_login = datetime.datetime.utcnow()
    db.session.commit()

    record_activity(user, "Successful login", icon="CheckCircle", color="text-emerald-400")
    token = generate_token(user.id, user.email, user.role)
    return jsonify({
        "message": "Login successful.",
        "token":   token,
        "user":    user.to_dict(),
    }), 200


@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    return jsonify({"user": user.to_dict()}), 200


@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    data  = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"message": "Email address is required."}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"message": "Please enter a valid email address."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "No account found with this email address."}), 404

    reset_token = generate_reset_token(user.id, user.email)
    reset_url   = f"http://localhost:5173/reset-password?token={reset_token}"

    msg         = Message(
        subject    = "CyberSense AI – Password Reset Request",
        recipients = [user.email],
        sender     = app.config["MAIL_DEFAULT_SENDER"],
    )
    msg.body = (
        f"Hello {user.name},\n\n"
        f"You requested a password reset for your CyberSense AI account.\n\n"
        f"Click the link below to set a new password:\n{reset_url}\n\n"
        f"This link is valid for 1 hour.\n\n"
        f"Stay Secure,\nCyberSense AI Team"
    )
    msg.html = f"""
    <div style="font-family:Arial,sans-serif;background:#0b0f19;padding:30px;color:#e2e8f0;border-radius:12px;">
      <h2 style="color:#38bdf8;">CyberSense AI – Password Reset</h2>
      <p>Hello <strong>{user.name}</strong>,</p>
      <p>You requested a password reset for your CyberSense AI account.</p>
      <p style="margin:25px 0;">
        <a href="{reset_url}" style="background:#06b6d4;color:#020617;padding:12px 24px;
           text-decoration:none;font-weight:bold;border-radius:8px;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p style="font-size:12px;color:#94a3b8;">
        Or copy and paste this link:<br/>
        <a href="{reset_url}" style="color:#38bdf8;">{reset_url}</a>
      </p>
      <hr style="border:0;border-top:1px solid #1e293b;margin:20px 0;"/>
      <p style="font-size:11px;color:#64748b;">If you did not request this, please ignore this email.</p>
    </div>
    """

    try:
        mail.send(msg)
        return jsonify({"message": f"Password reset link sent to {email}."}), 200
    except Exception as e:
        app.logger.error(f"Failed to send email: {e}")
        return jsonify({"message": f"Failed to send reset email: {str(e)}"}), 500


@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data         = request.get_json() or {}
    token        = data.get("token")
    new_password = data.get("password", "")

    if not token:
        return jsonify({"message": "Reset token is required."}), 400

    pw_err = validate_password(new_password)
    if pw_err:
        return jsonify({"message": pw_err, "field": "password"}), 400

    decoded = decode_token(token)
    if not decoded or decoded.get("type") != "reset":
        return jsonify({"message": "Invalid or expired reset link. Please request a new one."}), 400

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()

    return jsonify({"message": "Password has been reset successfully. You can now log in."}), 200


@app.route("/api/auth/google", methods=["POST"])
def google_auth():
    data       = request.get_json() or {}
    credential = data.get("credential") or data.get("token")

    if not credential:
        return jsonify({"message": "Google authentication credential is required."}), 400

    email      = None
    name       = None
    google_id  = None
    picture    = None
    verify_err = None

    # Primary: official Google token verification
    try:
        id_info   = id_token.verify_oauth2_token(credential, google_requests.Request(), GOOGLE_CLIENT_ID)
        email     = id_info.get("email")
        name      = id_info.get("name")
        google_id = id_info.get("sub")
        picture   = id_info.get("picture")
    except Exception as e:
        verify_err = str(e)
        # Fallback: tokeninfo endpoint
        try:
            resp = requests.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}",
                timeout=10,
            )
            if resp.status_code == 200:
                id_info = resp.json()
                if id_info.get("aud") != GOOGLE_CLIENT_ID:
                    return jsonify({"message": "Google token was issued for a different application."}), 400
                if id_info.get("email_verified") not in (True, "true"):
                    return jsonify({"message": "Google email address is not verified."}), 400
                email     = id_info.get("email")
                name      = id_info.get("name")
                google_id = id_info.get("sub")
                picture   = id_info.get("picture")
        except Exception as fe:
            verify_err = str(fe)

    if not email:
        app.logger.error(f"Google token verification failed: {verify_err}")
        return jsonify({"message": "Failed to verify Google token. Please try again."}), 400

    email = email.lower()
    user  = User.query.filter_by(email=email).first()

    if not user:
        user = User(
            name      = name or email.split("@")[0],
            email     = email,
            google_id = google_id,
            avatar    = picture or f"https://api.dicebear.com/7.x/bottts/svg?seed={email}",
        )
        db.session.add(user)
        db.session.commit()
        record_activity(user, "Google authentication successful", icon="ShieldCheck", color="text-cyan-400")
    else:
        # Update Google info if new
        updated = False
        if not user.google_id and google_id:
            user.google_id = google_id
            updated = True
        if picture and not user.avatar:
            user.avatar = picture
            updated = True
        if updated:
            db.session.commit()
        record_activity(user, "Google authentication successful", icon="ShieldCheck", color="text-cyan-400")

    token = generate_token(user.id, user.email, user.role)
    return jsonify({
        "message": "Google authentication successful.",
        "token":   token,
        "user":    user.to_dict(),
    }), 200


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out successfully."}), 200


# ─── Admin Authentication ────────────────────────────────────────────────────────

@app.route("/api/admin/login", methods=["POST"])
@limiter.limit("5 per minute")
def admin_login():
    data     = request.get_json() or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email:
        return jsonify({"message": "Email address is required.", "field": "email"}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"message": "Please enter a valid email address.", "field": "email"}), 400
    if not password:
        return jsonify({"message": "Password is required.", "field": "password"}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters.", "field": "password"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Account not found. Please check your email or register."}), 404

    if not user.password_hash:
        return jsonify({"message": "This account uses Google authentication. Please sign in with Google."}), 400

    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password."}), 401

    if user.role != "admin":
        return jsonify({"message": "Admin access required. This account does not have admin privileges."}), 403

    if not user.is_active:
        return jsonify({"message": "Account is suspended. Please contact support."}), 403

    user.last_login = datetime.datetime.utcnow()
    db.session.commit()

    record_activity(user, "Admin login successful", icon="ShieldCheck", color="text-cyan-400")

    audit_log = AuditLog(
        admin_id=user.id,
        action="ADMIN_LOGIN",
        details="Admin logged in successfully",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    token = generate_token(user.id, user.email, user.role, expires_in_hours=8)
    return jsonify({
        "message": "Admin login successful.",
        "token":   token,
        "user":    user.to_dict(),
    }), 200


@app.route("/api/admin/verify", methods=["GET"])
@admin_required
def verify_admin(user):
    return jsonify({
        "message": "Admin access verified.",
        "user":    user.to_dict(),
    }), 200


@app.route("/api/admin/logout", methods=["POST"])
@admin_required
def admin_logout(user):
    record_activity(user, "Admin logout", icon="LogOut", color="text-amber-400")

    audit_log = AuditLog(
        admin_id=user.id,
        action="ADMIN_LOGOUT",
        details="Admin logged out",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({"message": "Admin logged out successfully."}), 200


# ─── Admin Dashboard Statistics ──────────────────────────────────────────────────

@app.route("/api/admin/dashboard/stats", methods=["GET"])
@admin_required
def get_dashboard_stats(user):
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    
    today = datetime.datetime.utcnow().date()
    active_today = ActivityLog.query.filter(
        ActivityLog.created_at >= today,
        ActivityLog.activity.like("%login%")
    ).distinct(ActivityLog.user_id).count()
    
    week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    new_users_week = User.query.filter(User.created_at >= week_ago).count()
    
    total_scans = ScanResult.query.count()
    sms_scans = ScanResult.query.filter_by(module="sms").count()
    email_scans = ScanResult.query.filter_by(module="email").count()
    url_scans = ScanResult.query.filter_by(module="url").count()
    
    high_risk_users = SecurityScore.query.filter(SecurityScore.risk_score >= 70).count()
    medium_risk_users = SecurityScore.query.filter(
        SecurityScore.risk_score >= 40,
        SecurityScore.risk_score < 70
    ).count()
    low_risk_users = SecurityScore.query.filter(SecurityScore.risk_score < 40).count()
    
    avg_risk_score = db.session.query(db.func.avg(SecurityScore.risk_score)).scalar() or 0
    
    unread_notifications = AdminNotification.query.filter_by(is_read=False).count()
    
    return jsonify({
        "totalUsers": total_users,
        "activeUsers": active_users,
        "activeToday": active_today,
        "newUsersWeek": new_users_week,
        "totalScans": total_scans,
        "smsScans": sms_scans,
        "emailScans": email_scans,
        "urlScans": url_scans,
        "highRiskUsers": high_risk_users,
        "mediumRiskUsers": medium_risk_users,
        "lowRiskUsers": low_risk_users,
        "avgRiskScore": round(avg_risk_score, 2),
        "unreadNotifications": unread_notifications,
    }), 200


@app.route("/api/admin/dashboard/charts", methods=["GET"])
@admin_required
def get_dashboard_charts(user):
    # User registration trend (last 30 days)
    thirty_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    registration_trend = db.session.query(
        db.func.date(User.created_at).label('date'),
        db.func.count(User.id).label('count')
    ).filter(
        User.created_at >= thirty_days_ago
    ).group_by(db.func.date(User.created_at)).all()
    
    # Daily AI predictions (last 7 days)
    seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    daily_predictions = db.session.query(
        db.func.date(ScanResult.created_at).label('date'),
        db.func.count(ScanResult.id).label('count')
    ).filter(
        ScanResult.created_at >= seven_days_ago
    ).group_by(db.func.date(ScanResult.created_at)).all()
    
    # Risk distribution
    risk_distribution = [
        {"name": "High Risk", "value": SecurityScore.query.filter(SecurityScore.risk_score >= 70).count()},
        {"name": "Medium Risk", "value": SecurityScore.query.filter(
            SecurityScore.risk_score >= 40,
            SecurityScore.risk_score < 70
        ).count()},
        {"name": "Low Risk", "value": SecurityScore.query.filter(SecurityScore.risk_score < 40).count()},
    ]
    
    # Module usage
    module_usage = [
        {"name": "SMS Phishing", "value": ScanResult.query.filter_by(module="sms").count()},
        {"name": "Email Phishing", "value": ScanResult.query.filter_by(module="email").count()},
        {"name": "URL Scanner", "value": ScanResult.query.filter_by(module="url").count()},
    ]
    
    # Monthly user activity (last 6 months)
    six_months_ago = datetime.datetime.utcnow() - datetime.timedelta(days=180)
    monthly_activity = db.session.query(
        db.func.strftime('%Y-%m', ActivityLog.created_at).label('month'),
        db.func.count(ActivityLog.id).label('count')
    ).filter(
        ActivityLog.created_at >= six_months_ago
    ).group_by(db.func.strftime('%Y-%m', ActivityLog.created_at)).all()
    
    return jsonify({
        "registrationTrend": [{"date": str(r[0]), "count": r[1]} for r in registration_trend],
        "dailyPredictions": [{"date": str(r[0]), "count": r[1]} for r in daily_predictions],
        "riskDistribution": risk_distribution,
        "moduleUsage": module_usage,
        "monthlyActivity": [{"month": r[0], "count": r[1]} for r in monthly_activity],
    }), 200


# ─── User Management ───────────────────────────────────────────────────────────

@app.route("/api/admin/users", methods=["GET"])
@admin_required
def get_users(user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", "")
    role_filter = request.args.get("role", "")
    status_filter = request.args.get("status", "")

    query = User.query

    if search:
        query = query.filter(
            db.or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )

    if role_filter:
        query = query.filter(User.role == role_filter)

    if status_filter == "active":
        query = query.filter(User.is_active == True)
    elif status_filter == "suspended":
        query = query.filter(User.is_active == False)

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    users_data = []
    for u in pagination.items:
        security_score = SecurityScore.query.filter_by(user_id=u.id).first()
        users_data.append({
            **u.to_dict(),
            "riskScore": security_score.risk_score if security_score else 0,
            "securityLevel": security_score.security_level if security_score else "Low",
        })

    return jsonify({
        "users": users_data,
        "total": pagination.total,
        "pages": pagination.pages,
        "currentPage": page,
    }), 200


@app.route("/api/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user_details(user, user_id):
    target_user = db.session.get(User, user_id)
    if not target_user:
        return jsonify({"message": "User not found."}), 404

    security_score = SecurityScore.query.filter_by(user_id=user_id).first()
    activity_logs = ActivityLog.query.filter_by(user_id=user_id).order_by(
        ActivityLog.created_at.desc()
    ).limit(20).all()
    scan_results = ScanResult.query.filter_by(user_id=user_id).order_by(
        ScanResult.created_at.desc()
    ).limit(10).all()

    return jsonify({
        "user": target_user.to_dict(),
        "securityScore": security_score.to_dict() if security_score else None,
        "activityLogs": [log.to_dict() for log in activity_logs],
        "recentScans": [scan.to_dict() for scan in scan_results],
    }), 200


@app.route("/api/admin/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(user, user_id):
    target_user = db.session.get(User, user_id)
    if not target_user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}

    if "name" in data:
        name_err = validate_name(data["name"])
        if name_err:
            return jsonify({"message": name_err, "field": "name"}), 400
        target_user.name = data["name"]

    if "email" in data:
        email_err = validate_email(data["email"])
        if email_err:
            return jsonify({"message": email_err, "field": "email"}), 400
        if User.query.filter(User.email == data["email"], User.id != user_id).first():
            return jsonify({"message": "Email already in use.", "field": "email"}), 409
        target_user.email = data["email"].lower()

    if "role" in data:
        if data["role"] not in ["user", "admin"]:
            return jsonify({"message": "Invalid role. Must be 'user' or 'admin'."}), 400
        target_user.role = data["role"]

    if "is_active" in data:
        target_user.is_active = data["is_active"]

    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="USER_UPDATED",
        target_type="User",
        target_id=user_id,
        details=f"Updated user: {target_user.email}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({
        "message": "User updated successfully.",
        "user": target_user.to_dict(),
    }), 200


@app.route("/api/admin/users/<int:user_id>/suspend", methods=["POST"])
@admin_required
def suspend_user(user, user_id):
    target_user = db.session.get(User, user_id)
    if not target_user:
        return jsonify({"message": "User not found."}), 404

    if target_user.id == user.id:
        return jsonify({"message": "Cannot suspend your own account."}), 400

    target_user.is_active = False
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="USER_SUSPENDED",
        target_type="User",
        target_id=user_id,
        details=f"Suspended user: {target_user.email}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({"message": "User suspended successfully."}), 200


@app.route("/api/admin/users/<int:user_id>/activate", methods=["POST"])
@admin_required
def activate_user(user, user_id):
    target_user = db.session.get(User, user_id)
    if not target_user:
        return jsonify({"message": "User not found."}), 404

    target_user.is_active = True
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="USER_ACTIVATED",
        target_type="User",
        target_id=user_id,
        details=f"Activated user: {target_user.email}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({"message": "User activated successfully."}), 200


@app.route("/api/admin/users/<int:user_id>/reset-password", methods=["POST"])
@admin_required
def reset_user_password(user, user_id):
    target_user = db.session.get(User, user_id)
    if not target_user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}
    new_password = data.get("password", "")

    pw_err = validate_password(new_password)
    if pw_err:
        return jsonify({"message": pw_err, "field": "password"}), 400

    target_user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="PASSWORD_RESET",
        target_type="User",
        target_id=user_id,
        details=f"Reset password for user: {target_user.email}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({"message": "Password reset successfully."}), 200


@app.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user, user_id):
    target_user = db.session.get(User, user_id)
    if not target_user:
        return jsonify({"message": "User not found."}), 404

    if target_user.id == user.id:
        return jsonify({"message": "Cannot delete your own account."}), 400

    user_email = target_user.email

    # Delete related records
    SecurityScore.query.filter_by(user_id=user_id).delete()
    ActivityLog.query.filter_by(user_id=user_id).delete()
    Achievement.query.filter_by(user_id=user_id).delete()
    NotificationSetting.query.filter_by(user_id=user_id).delete()
    PrivacySetting.query.filter_by(user_id=user_id).delete()
    RiskTrend.query.filter_by(user_id=user_id).delete()
    ScanResult.query.filter_by(user_id=user_id).delete()

    db.session.delete(target_user)
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="USER_DELETED",
        target_type="User",
        target_id=user_id,
        details=f"Deleted user: {user_email}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({"message": "User deleted successfully."}), 200


# ─── AI Module Management ───────────────────────────────────────────────────────

@app.route("/api/admin/ai-models", methods=["GET"])
@admin_required
def get_ai_models(user):
    models = AIModel.query.order_by(AIModel.module).all()
    return jsonify({
        "models": [model.to_dict() for model in models],
    }), 200


@app.route("/api/admin/ai-models/<int:model_id>", methods=["PUT"])
@admin_required
def update_ai_model(user, model_id):
    model = db.session.get(AIModel, model_id)
    if not model:
        return jsonify({"message": "AI model not found."}), 404

    data = request.get_json() or {}

    if "is_enabled" in data:
        model.is_enabled = data["is_enabled"]

    if "accuracy" in data:
        model.accuracy = data["accuracy"]

    if "version" in data:
        model.version = data["version"]

    if "error_logs" in data:
        model.error_logs = data["error_logs"]

    model.last_updated = datetime.datetime.utcnow()
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="AI_MODEL_UPDATED",
        target_type="AIModel",
        target_id=model_id,
        details=f"Updated AI model: {model.name}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({
        "message": "AI model updated successfully.",
        "model": model.to_dict(),
    }), 200


@app.route("/api/admin/ai-models/<int:model_id>/toggle", methods=["POST"])
@admin_required
def toggle_ai_model(user, model_id):
    model = db.session.get(AIModel, model_id)
    if not model:
        return jsonify({"message": "AI model not found."}), 404

    model.is_enabled = not model.is_enabled
    model.last_updated = datetime.datetime.utcnow()
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="AI_MODEL_TOGGLED",
        target_type="AIModel",
        target_id=model_id,
        details=f"{'Enabled' if model.is_enabled else 'Disabled'} AI model: {model.name}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({
        "message": f"AI model {'enabled' if model.is_enabled else 'disabled'} successfully.",
        "model": model.to_dict(),
    }), 200


# ─── Risk Management ───────────────────────────────────────────────────────────

@app.route("/api/admin/risk-users", methods=["GET"])
@admin_required
def get_risk_users(user):
    risk_level = request.args.get("level", "")
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    query = SecurityScore.query.join(User, SecurityScore.user_id == User.id)

    if risk_level == "high":
        query = query.filter(SecurityScore.risk_score >= 70)
    elif risk_level == "medium":
        query = query.filter(SecurityScore.risk_score >= 40, SecurityScore.risk_score < 70)
    elif risk_level == "low":
        query = query.filter(SecurityScore.risk_score < 40)

    pagination = query.order_by(SecurityScore.risk_score.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    risk_users = []
    for score in pagination.items:
        user_data = db.session.get(User, score.user_id)
        if user_data:
            risk_users.append({
                **user_data.to_dict(),
                "riskScore": score.risk_score,
                "securityLevel": score.security_level,
                "passwordStrength": score.password_strength,
            })

    return jsonify({
        "users": risk_users,
        "total": pagination.total,
        "pages": pagination.pages,
        "currentPage": page,
    }), 200


# ─── Report Management ─────────────────────────────────────────────────────────

@app.route("/api/admin/reports", methods=["GET"])
@admin_required
def get_reports(user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    module_filter = request.args.get("module", "")
    threat_filter = request.args.get("threat_level", "")

    query = ScanResult.query.join(User, ScanResult.user_id == User.id)

    if module_filter:
        query = query.filter(ScanResult.module == module_filter)

    if threat_filter:
        query = query.filter(ScanResult.threat_level == threat_filter)

    pagination = query.order_by(ScanResult.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    reports = []
    for scan in pagination.items:
        user_data = db.session.get(User, scan.user_id)
        reports.append({
            **scan.to_dict(),
            "userEmail": user_data.email if user_data else "Unknown",
            "userName": user_data.name if user_data else "Unknown",
        })

    return jsonify({
        "reports": reports,
        "total": pagination.total,
        "pages": pagination.pages,
        "currentPage": page,
    }), 200


@app.route("/api/admin/reports/<int:report_id>", methods=["DELETE"])
@admin_required
def delete_report(user, report_id):
    report = db.session.get(ScanResult, report_id)
    if not report:
        return jsonify({"message": "Report not found."}), 404

    db.session.delete(report)
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="REPORT_DELETED",
        target_type="ScanResult",
        target_id=report_id,
        details=f"Deleted scan report ID: {report_id}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({"message": "Report deleted successfully."}), 200


# ─── Security Logs ─────────────────────────────────────────────────────────────

@app.route("/api/admin/security-logs", methods=["GET"])
@admin_required
def get_security_logs(user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    level_filter = request.args.get("level", "")
    module_filter = request.args.get("module", "")

    query = SystemLog.query

    if level_filter:
        query = query.filter(SystemLog.level == level_filter)

    if module_filter:
        query = query.filter(SystemLog.module == module_filter)

    pagination = query.order_by(SystemLog.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "logs": [log.to_dict() for log in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "currentPage": page,
    }), 200


@app.route("/api/admin/security-logs", methods=["POST"])
@admin_required
def create_security_log(user):
    data = request.get_json() or {}

    log = SystemLog(
        level=data.get("level", "INFO"),
        module=data.get("module", ""),
        message=data.get("message", ""),
        details=data.get("details", ""),
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "message": "Security log created successfully.",
        "log": log.to_dict(),
    }), 201


# ─── Audit Logs ───────────────────────────────────────────────────────────────

@app.route("/api/admin/audit-logs", methods=["GET"])
@admin_required
def get_audit_logs(user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    action_filter = request.args.get("action", "")

    query = AuditLog.query

    if action_filter:
        query = query.filter(AuditLog.action.ilike(f"%{action_filter}%"))

    pagination = query.order_by(AuditLog.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    logs_data = []
    for log in pagination.items:
        admin_user = db.session.get(User, log.admin_id)
        logs_data.append({
            **log.to_dict(),
            "adminName": admin_user.name if admin_user else "Unknown",
            "adminEmail": admin_user.email if admin_user else "Unknown",
        })

    return jsonify({
        "logs": logs_data,
        "total": pagination.total,
        "pages": pagination.pages,
        "currentPage": page,
    }), 200


# ─── Feedback Management ──────────────────────────────────────────────────────

@app.route("/api/admin/feedback", methods=["GET"])
@admin_required
def get_feedback(user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status_filter = request.args.get("status", "")

    query = Feedback.query

    if status_filter == "read":
        query = query.filter(Feedback.is_read == True)
    elif status_filter == "unread":
        query = query.filter(Feedback.is_read == False)
    elif status_filter == "archived":
        query = query.filter(Feedback.is_archived == True)

    pagination = query.order_by(Feedback.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "feedback": [fb.to_dict() for fb in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "currentPage": page,
    }), 200


@app.route("/api/admin/feedback/<int:feedback_id>/read", methods=["POST"])
@admin_required
def mark_feedback_read(user, feedback_id):
    feedback = db.session.get(Feedback, feedback_id)
    if not feedback:
        return jsonify({"message": "Feedback not found."}), 404

    feedback.is_read = True
    db.session.commit()

    return jsonify({"message": "Feedback marked as read.", "feedback": feedback.to_dict()}), 200


@app.route("/api/admin/feedback/<int:feedback_id>/archive", methods=["POST"])
@admin_required
def archive_feedback(user, feedback_id):
    feedback = db.session.get(Feedback, feedback_id)
    if not feedback:
        return jsonify({"message": "Feedback not found."}), 404

    feedback.is_archived = True
    db.session.commit()

    return jsonify({"message": "Feedback archived.", "feedback": feedback.to_dict()}), 200


@app.route("/api/admin/feedback/<int:feedback_id>", methods=["DELETE"])
@admin_required
def delete_feedback(user, feedback_id):
    feedback = db.session.get(Feedback, feedback_id)
    if not feedback:
        return jsonify({"message": "Feedback not found."}), 404

    db.session.delete(feedback)
    db.session.commit()

    return jsonify({"message": "Feedback deleted successfully."}), 200


# ─── System Settings ───────────────────────────────────────────────────────────

@app.route("/api/admin/settings", methods=["GET"])
@admin_required
def get_settings(user):
    category = request.args.get("category", "")

    query = SystemSetting.query
    if category:
        query = query.filter(SystemSetting.category == category)

    settings = query.order_by(SystemSetting.category, SystemSetting.key).all()
    return jsonify({
        "settings": [setting.to_dict() for setting in settings],
    }), 200


@app.route("/api/admin/settings", methods=["POST"])
@admin_required
def create_setting(user):
    data = request.get_json() or {}

    if not data.get("key") or not data.get("category"):
        return jsonify({"message": "Key and category are required."}), 400

    if SystemSetting.query.filter_by(key=data["key"]).first():
        return jsonify({"message": "Setting with this key already exists."}), 409

    setting = SystemSetting(
        key=data["key"],
        value=data.get("value", ""),
        category=data["category"],
        description=data.get("description", ""),
    )
    db.session.add(setting)
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="SETTING_CREATED",
        target_type="SystemSetting",
        target_id=setting.id,
        details=f"Created setting: {data['key']}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({
        "message": "Setting created successfully.",
        "setting": setting.to_dict(),
    }), 201


@app.route("/api/admin/settings/<int:setting_id>", methods=["PUT"])
@admin_required
def update_setting(user, setting_id):
    setting = db.session.get(SystemSetting, setting_id)
    if not setting:
        return jsonify({"message": "Setting not found."}), 404

    data = request.get_json() or {}

    if "value" in data:
        setting.value = data["value"]
    if "description" in data:
        setting.description = data["description"]

    setting.updated_at = datetime.datetime.utcnow()
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="SETTING_UPDATED",
        target_type="SystemSetting",
        target_id=setting_id,
        details=f"Updated setting: {setting.key}",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({
        "message": "Setting updated successfully.",
        "setting": setting.to_dict(),
    }), 200


# ─── Database Management ───────────────────────────────────────────────────────

@app.route("/api/admin/database/status", methods=["GET"])
@admin_required
def get_database_status(user):
    total_users = User.query.count()
    total_scans = ScanResult.query.count()
    total_logs = SystemLog.query.count()
    total_audit_logs = AuditLog.query.count()

    return jsonify({
        "status": "healthy",
        "totalRecords": total_users + total_scans + total_logs + total_audit_logs,
        "users": total_users,
        "scans": total_scans,
        "logs": total_logs,
        "auditLogs": total_audit_logs,
    }), 200


@app.route("/api/admin/database/cleanup", methods=["POST"])
@admin_required
def cleanup_database(user):
    data = request.get_json() or {}
    days_old = data.get("days_old", 90)

    cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_old)

    deleted_logs = SystemLog.query.filter(SystemLog.created_at < cutoff_date).delete()
    db.session.commit()

    audit_log = AuditLog(
        admin_id=user.id,
        action="DATABASE_CLEANUP",
        details=f"Cleaned up {deleted_logs} old system logs older than {days_old} days",
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({
        "message": f"Database cleanup completed. Deleted {deleted_logs} old records.",
        "deletedRecords": deleted_logs,
    }), 200


# ─── Notification Center ─────────────────────────────────────────────────────

@app.route("/api/admin/notifications", methods=["GET"])
@admin_required
def get_notifications(user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    priority_filter = request.args.get("priority", "")
    type_filter = request.args.get("type", "")

    query = AdminNotification.query

    if priority_filter:
        query = query.filter(AdminNotification.priority == priority_filter)

    if type_filter:
        query = query.filter(AdminNotification.type == type_filter)

    pagination = query.order_by(AdminNotification.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "notifications": [notif.to_dict() for notif in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "currentPage": page,
    }), 200


@app.route("/api/admin/notifications", methods=["POST"])
@admin_required
def create_notification(user):
    data = request.get_json() or {}

    if not data.get("type") or not data.get("title") or not data.get("message"):
        return jsonify({"message": "Type, title, and message are required."}), 400

    notification = AdminNotification(
        type=data["type"],
        title=data["title"],
        message=data["message"],
        priority=data.get("priority", "medium"),
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({
        "message": "Notification created successfully.",
        "notification": notification.to_dict(),
    }), 201


@app.route("/api/admin/notifications/<int:notification_id>/read", methods=["POST"])
@admin_required
def mark_notification_read(user, notification_id):
    notification = db.session.get(AdminNotification, notification_id)
    if not notification:
        return jsonify({"message": "Notification not found."}), 404

    notification.is_read = True
    db.session.commit()

    return jsonify({"message": "Notification marked as read.", "notification": notification.to_dict()}), 200


@app.route("/api/admin/notifications/mark-all-read", methods=["POST"])
@admin_required
def mark_all_notifications_read(user):
    AdminNotification.query.update({AdminNotification.is_read: True})
    db.session.commit()

    return jsonify({"message": "All notifications marked as read."}), 200


@app.route("/api/admin/notifications/<int:notification_id>", methods=["DELETE"])
@admin_required
def delete_notification(user, notification_id):
    notification = db.session.get(AdminNotification, notification_id)
    if not notification:
        return jsonify({"message": "Notification not found."}), 404

    db.session.delete(notification)
    db.session.commit()

    return jsonify({"message": "Notification deleted successfully."}), 200


# ─── Profile Management ────────────────────────────────────────────────────────

@app.route("/api/profile", methods=["GET"])
def get_profile():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    return jsonify({
        "user": user.to_dict(),
        "security": build_security_summary(user),
    }), 200


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}
    
    # Update name
    if "name" in data:
        name = data.get("name", "").strip()
        name_err = validate_name(name)
        if name_err:
            return jsonify({"message": name_err, "field": "name"}), 400
        user.name = name
    
    # Update avatar
    if "avatar" in data:
        user.avatar = data.get("avatar")
    
    db.session.commit()
    record_activity(user, "Profile updated", icon="User", color="text-purple-400")
    
    return jsonify({
        "message": "Profile updated successfully.",
        "user": user.to_dict()
    }), 200


@app.route("/api/profile/avatar", methods=["POST"])
def upload_avatar():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    # For now, accept avatar URL. In production, you'd handle file upload
    data = request.get_json() or {}
    avatar_url = data.get("avatar")
    
    if not avatar_url:
        return jsonify({"message": "Avatar URL is required."}), 400
    
    user.avatar = avatar_url
    db.session.commit()
    
    return jsonify({
        "message": "Avatar updated successfully.",
        "user": user.to_dict()
    }), 200


@app.route("/api/profile/avatar", methods=["DELETE"])
def remove_avatar():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    user.avatar = None
    db.session.commit()
    
    return jsonify({
        "message": "Avatar removed successfully.",
        "user": user.to_dict()
    }), 200


@app.route("/api/profile/password", methods=["POST"])
def change_password():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}
    current_password = data.get("currentPassword", "")
    new_password = data.get("newPassword", "")
    
    if not current_password:
        return jsonify({"message": "Current password is required.", "field": "currentPassword"}), 400
    
    if not user.password_hash:
        return jsonify({"message": "This account uses Google authentication."}), 400
    
    if not bcrypt.check_password_hash(user.password_hash, current_password):
        return jsonify({"message": "Current password is incorrect.", "field": "currentPassword"}), 401
    
    pw_err = validate_password(new_password)
    if pw_err:
        return jsonify({"message": pw_err, "field": "newPassword"}), 400
    
    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    record_activity(user, "Password changed", icon="Lock", color="text-amber-400")
    
    return jsonify({"message": "Password changed successfully."}), 200


@app.route("/api/profile/account", methods=["DELETE"])
def delete_account():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}
    password = data.get("password", "")
    
    if not password:
        return jsonify({"message": "Password is required to delete account."}), 400
    
    if not user.password_hash:
        return jsonify({"message": "This account uses Google authentication."}), 400
    
    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"message": "Incorrect password."}), 401
    
    ScanResult.query.filter_by(user_id=user.id).delete()
    RiskTrend.query.filter_by(user_id=user.id).delete()
    PrivacySetting.query.filter_by(user_id=user.id).delete()
    NotificationSetting.query.filter_by(user_id=user.id).delete()
    Achievement.query.filter_by(user_id=user.id).delete()
    ActivityLog.query.filter_by(user_id=user.id).delete()
    SecurityScore.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"message": "Account deleted successfully."}), 200


@app.route("/api/profile/activity", methods=["GET"])
def get_activity():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    activities = []
    for entry in (
        ActivityLog.query.filter_by(user_id=user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(6)
        .all()
    ):
        activities.append({
            "icon": entry.icon,
            "color": entry.color,
            "activity": entry.activity,
            "date": entry.created_at.strftime("%Y-%m-%d") if entry.created_at else None,
            "time": entry.created_at.strftime("%H:%M") if entry.created_at else None,
        })

    return jsonify({"activities": activities}), 200


@app.route("/api/profile/security-score", methods=["GET"])
def get_security_score():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    summary = build_security_summary(user)
    return jsonify({
        "securityScore": summary["securityScore"],
        "securityLevel": summary["securityLevel"],
        "riskScore": summary["riskScore"],
        "factors": {
            "passwordStrength": summary["passwordStrength"],
            "googleConnected": summary["googleConnected"],
            "accountAge": (datetime.datetime.utcnow() - user.created_at).days if user.created_at else 0,
        }
    }), 200


@app.route("/api/profile/download", methods=["GET"])
def download_user_data():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization token required."}), 401

    token   = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        return jsonify({"message": "Session expired or invalid token."}), 401

    user = db.session.get(User, decoded.get("user_id"))
    if not user:
        return jsonify({"message": "User not found."}), 404

    summary = build_security_summary(user)
    user_data = {
        "profile": {
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar,
            "googleConnected": bool(user.google_id),
        },
        "account": {
            "createdAt": user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else None,
            "status": "Active",
        },
        "security": {
            "securityScore": summary["securityScore"],
            "riskScore": summary["riskScore"],
        },
        "exportDate": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
    }
    
    return jsonify(user_data), 200


@app.route("/api/scan/sms", methods=["POST"])
def scan_sms():
    user, error = get_authenticated_user()
    if error:
        return error

    data = request.get_json() or {}
    result, error = create_scan_result(user, "sms", data.get("content", ""))
    if error:
        return error

    return jsonify({"message": "SMS analysis complete.", "result": result}), 201


@app.route("/api/scan/email", methods=["POST"])
def scan_email():
    user, error = get_authenticated_user()
    if error:
        return error

    data = request.get_json() or {}
    result, error = create_scan_result(user, "email", data.get("content", ""))
    if error:
        return error

    return jsonify({"message": "Email analysis complete.", "result": result}), 201


@app.route("/api/scan/url", methods=["POST"])
def scan_url():
    user, error = get_authenticated_user()
    if error:
        return error

    data = request.get_json() or {}
    result, error = create_scan_result(user, "url", data.get("content", ""))
    if error:
        return error

    return jsonify({"message": "URL analysis complete.", "result": result}), 201


@app.route("/api/reports", methods=["GET"])
def list_reports():
    user, error = get_authenticated_user()
    if error:
        return error

    reports = (
        ScanResult.query
        .filter_by(user_id=user.id)
        .order_by(ScanResult.created_at.desc())
        .limit(100)
        .all()
    )
    return jsonify({"reports": [report.to_dict() for report in reports]}), 200


@app.route("/api/reports/<int:report_id>", methods=["GET"])
def get_report(report_id):
    user, error = get_authenticated_user()
    if error:
        return error

    report = ScanResult.query.filter_by(id=report_id, user_id=user.id).first()
    if not report:
        return jsonify({"message": "Report not found."}), 404

    return jsonify({"report": report.to_dict()}), 200


# ─── DB Init ─────────────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
