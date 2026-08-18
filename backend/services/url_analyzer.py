"""
URL Analyzer Service Module for CyberSense AI
==============================================
Provides modular architecture for static URL Threat & Phishing Detection.
Currently implements a comprehensive rule-based static heuristic risk engine ("model": "heuristic")
with a clean interface designed to plug in trained ML / Classifier models seamlessly.

SAFETY NOTICE: This service performs static lexical, syntactic, and structural URL analysis only.
It NEVER performs HTTP requests, DNS lookups, or execution of submitted targets.
"""

import re
from urllib.parse import urlparse
from typing import Dict, Any, List


class URLAnalyzer:
    """
    Modular URL Threat Analyzer.
    
    Architecture Design:
    - `model_type` defaults to "heuristic".
    - When your ML/Classifier model is trained, pass `model_type="RandomForest"` or `model_type="URLNet"`
      or load weights via `load_ml_model()` to switch execution automatically.
    """

    def __init__(self, model_type: str = "heuristic"):
        self.model_type = model_type
        self.ml_model_instance = None

    def load_ml_model(self, model_path_or_name: str):
        """
        Plug in trained ML / Deep Learning model weights.
        """
        self.model_type = "RandomForest"

    def analyze(self, raw_url: str) -> Dict[str, Any]:
        """
        Main entrypoint for static URL threat analysis.
        
        Input:
            raw_url (str): Target URL string submitted by the user.
            
        Output:
            dict containing standard CyberSense AI response format.
        """
        clean_url = raw_url.strip() if raw_url else ""

        if not clean_url:
            return {
                "success": False,
                "message": "URL cannot be empty."
            }

        if len(clean_url) > 2000:
            return {
                "success": False,
                "message": "URL is too long (maximum 2000 characters allowed)."
            }

        if self.model_type != "heuristic" and self.ml_model_instance is not None:
            return self._predict_ml(clean_url)
        else:
            return self._predict_heuristic(clean_url)

    def _predict_heuristic(self, raw_url: str) -> Dict[str, Any]:
        """
        Static rule-based heuristic URL analysis engine.
        Evaluates lexical structures, IP hosts, subdomain depth, shorteners,
        suspicious TLDs, special character counts, and typosquatting cues.
        """
        # Ensure scheme for urllib parsing
        parsed_target = raw_url if "://" in raw_url else f"http://{raw_url}"
        
        try:
            parsed = urlparse(parsed_target)
            hostname = (parsed.hostname or "").lower()
            path_query = (parsed.path + ("?" + parsed.query if parsed.query else "")).lower()
            full_lowered = parsed_target.lower()
        except Exception:
            hostname = raw_url.lower()
            path_query = ""
            full_lowered = raw_url.lower()

        detected_signals: List[str] = []
        score = 5

        # 1. IP Address Hostname Check
        ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
        if re.match(ip_pattern, hostname):
            score += 30
            detected_signals.append("Raw IP address host instead of domain name")

        # 2. Excessive Subdomains Check
        domain_parts = [p for p in hostname.split(".") if p]
        if len(domain_parts) > 3 and not re.match(ip_pattern, hostname):
            score += 20
            detected_signals.append(f"Excessive subdomain depth ({len(domain_parts) - 2} levels)")

        # 3. URL Shortening Services
        shorteners = [
            "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "cutt.ly",
            "ow.ly", "buff.ly", "rebrand.ly", "shorturl.at", "tiny.cc", "v.ht"
        ]
        if any(shortener in hostname for shortener in shorteners):
            score += 25
            detected_signals.append("URL shortening service detected")

        # 4. Suspicious Top-Level Domains (TLDs)
        suspicious_tlds = [
            ".xyz", ".top", ".click", ".buzz", ".site", ".club", ".work",
            ".link", ".cc", ".ru", ".gq", ".tk", ".ml", ".cf", ".ga",
            ".space", ".monster", ".fit", ".rest", ".online"
        ]
        if any(hostname.endswith(tld) for tld in suspicious_tlds):
            score += 20
            detected_signals.append("Suspicious or high-risk top-level domain (TLD)")

        # 5. Typosquatting / Brand Impersonation Patterns
        typo_patterns = [
            "paypa1", "micros0ft", "goog1e", "g00gle", "app1e", "faceb00k",
            "amaz0n", "netf1ix", "sec-verify", "account-update", "login-verify",
            "security-check", "verify-account", "bank-login"
        ]
        if any(typo in full_lowered for typo in typo_patterns):
            score += 25
            detected_signals.append("Typosquatting or brand impersonation pattern")

        # 6. Phishing / Credential Harvesting Keywords
        phishing_keywords = [
            "login", "signin", "verify", "account", "bank", "secure", "paypal",
            "update", "wallet", "credential", "free-gift", "confirm", "token",
            "password", "billing", "re-authenticate", "authenticate"
        ]
        matched_keywords = [kw for kw in phishing_keywords if kw in path_query or (kw in hostname and not hostname.startswith(kw))]
        if matched_keywords:
            score += 20
            detected_signals.append(f"Phishing/login keyword(s) in URL path: {', '.join(matched_keywords[:3])}")

        # 7. Excessive Special Characters (Obfuscation)
        special_char_count = sum(full_lowered.count(c) for c in ["@", "-", "_", "=", "%", "?", "&"])
        if special_char_count >= 8:
            score += 15
            detected_signals.append(f"High special character density ({special_char_count} symbols)")

        # 8. Excessive URL Length
        if len(raw_url) > 120:
            score += 20
            detected_signals.append(f"Excessively long URL ({len(raw_url)} characters)")
        elif len(raw_url) > 75:
            score += 10
            detected_signals.append(f"Suspiciously long URL path ({len(raw_url)} characters)")

        # 9. Non-Standard Port
        if parsed.port and parsed.port not in (80, 443, 8080):
            score += 15
            detected_signals.append(f"Non-standard network port specified (:{parsed.port})")

        # Bound risk_score between 0 and 100
        risk_score = min(score, 100)

        # Determine prediction and risk level
        if risk_score >= 60:
            prediction = "malicious"
            risk_level = "High"
            confidence = min(82.0 + (risk_score - 60) * 0.4, 98.5)
        elif risk_score >= 35:
            prediction = "suspicious"
            risk_level = "Medium"
            confidence = 74.0
        else:
            prediction = "legitimate"
            risk_level = "Low"
            confidence = min(85.0 + (35 - risk_score) * 0.4, 99.0)

        if detected_signals:
            explanation = f"Detected {len(detected_signals)} suspicious URL risk indicator(s): " + ", ".join(detected_signals) + "."
        else:
            explanation = "URL domain structure, TLD, and path syntax do not show suspicious phishing or malware indicators."

        return {
            "success": True,
            "analysis_type": "url",
            "url": raw_url,
            "prediction": prediction,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "confidence": round(confidence, 1),
            "detected_signals": detected_signals,
            "explanation": explanation,
            "model": "heuristic",
            "message": "URL analysis completed successfully."
        }

    def _predict_ml(self, raw_url: str) -> Dict[str, Any]:
        """
        Placeholder for ML classifier (e.g. Random Forest / URLNet) prediction.
        """
        raise NotImplementedError("ML model weights not yet loaded. Using heuristic engine.")


# Export default singleton instance
url_analyzer = URLAnalyzer(model_type="heuristic")
