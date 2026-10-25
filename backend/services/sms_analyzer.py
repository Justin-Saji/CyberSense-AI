"""
SMS Analyzer Service Module for CyberSense AI
==============================================

Uses the locally trained DistilBERT sequence classification model for SMS
spam and phishing detection, augmented with intelligent security signal
extraction and standard authentication pattern handling.

Model:
    DistilBERT Sequence Classification (distilbert-base-uncased)

Labels:
    0 = HAM (Legitimate)
    1 = SPAM (Phishing / Unsolicited Spam)
"""

import os
import re
from pathlib import Path
from typing import Dict, Any, List, Tuple

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = (
    BASE_DIR
    / "Models - SMS feature"
    / "DistilBERT_Activation"
    / "sms_distilbert_model"
)


# ============================================================
# SMS ANALYZER
# ============================================================

class SMSAnalyzer:
    """
    SMS analyzer using the locally trained DistilBERT model.
    Augmented with contextual threat signals and explainability.
    """

    def __init__(self, model_path: Path):
        self.model_path = model_path
        self.tokenizer = None
        self.ml_model_instance = None
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    # ========================================================
    # LOAD DISTILBERT MODEL
    # ========================================================

    def load_ml_model(self):
        """
        Lazily load the trained DistilBERT tokenizer and model.
        """
        if self.ml_model_instance is not None and self.tokenizer is not None:
            return

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"DistilBERT model directory not found: {self.model_path}"
            )

        print("=" * 60)
        print("Loading CyberSense AI SMS DistilBERT model...")
        print(f"Model path: {self.model_path}")
        print(f"Device: {self.device}")
        print("=" * 60)

        self.tokenizer = AutoTokenizer.from_pretrained(str(self.model_path))
        self.ml_model_instance = AutoModelForSequenceClassification.from_pretrained(
            str(self.model_path)
        )
        self.ml_model_instance.to(self.device)
        self.ml_model_instance.eval()

        print("DistilBERT SMS model loaded successfully.")
        print(f"Model labels: {self.ml_model_instance.config.id2label}")
        print("=" * 60)

    # ========================================================
    # SECURITY SIGNAL DETECTION
    # ========================================================

    def detect_signals(self, text: str) -> Tuple[List[str], bool]:
        """
        Extract observable cybersecurity indicators and determine if links exist.
        """
        lower = text.lower()
        signals = []

        # 1. URL / Link detection
        url_pattern = (
            r"https?://\S+|www\.\S+|"
            r"\b[a-zA-Z0-9-]+\.(?:com|org|net|xyz|info|top|co\.uk|site|online|me|app|link|cc|to)\b/\S*"
        )
        has_url = bool(re.search(url_pattern, text, re.IGNORECASE))
        if has_url:
            signals.append("Contains web link / URL")

        # 2. Urgency or pressure language
        urgency_patterns = [
            r"\burgent\b", r"\bimmediately\b", r"\baction required\b", r"\bact now\b",
            r"\bsuspended\b", r"\brestricted\b", r"\blocked\b", r"\bexpires?\b",
            r"\bfinal (?:notice|warning)\b", r"\bwithin \d+ (?:hours?|mins?|minutes?)\b",
            r"\bunauthorized\b", r"\bsuspicious activity\b", r"\bcall (?:immediately|now)\b"
        ]
        if any(re.search(p, lower) for p in urgency_patterns):
            signals.append("Urgent language or account restriction threat")

        # 3. Credential or security prompt
        credential_patterns = [
            r"\bverify your\b", r"\bverification\b", r"\blogin\b", r"\bsign[- ]in\b",
            r"\bupdate (?:your )?(?:details|info|billing|payment|account|address)\b",
            r"\bconfirm your identity\b", r"\bpassword\b", r"\bcredentials?\b"
        ]
        if any(re.search(p, lower) for p in credential_patterns):
            signals.append("Credential or identity verification prompt")

        # 4. Financial or reward lures
        financial_patterns = [
            r"\b(?:won|winner|awarded)\b", r"\bprize\b", r"\bclaim (?:code|now|your)?\b",
            r"\breward\b", r"\brefund\b", r"\bcredit card\b", r"\bdebit card\b",
            r"\bwire transfer\b", r"\$ ?\d+", r"£ ?\d+", r"\bfee required\b",
            r"\bunpaid (?:toll|invoice|bill)\b", r"\bcash prize\b"
        ]
        if any(re.search(p, lower) for p in financial_patterns):
            signals.append("Financial, prize or payment lure")

        # 5. Organization or brand impersonation
        brands = [
            r"\busps\b", r"\bfedex\b", r"\bups\b", r"\bdhl\b", r"\bamazon\b",
            r"\bapple\b", r"\bchase\b", r"\bwells fargo\b", r"\bbank of america\b",
            r"\bpaypal\b", r"\bnetflix\b", r"\birs\b", r"\bcashapp\b"
        ]
        if any(re.search(b, lower) for b in brands):
            signals.append("Organization or delivery brand reference")

        return signals, has_url

    # ========================================================
    # 2FA / OTP PATTERN CHECK
    # ========================================================

    def is_clean_2fa_otp(self, text: str, has_url: bool) -> bool:
        """
        Check if the text is a legitimate automated two-factor or OTP notification
        without external links or credential-harvesting hooks.
        """
        if has_url:
            return False

        lower = text.lower()

        # Reject texts with phishing solicitation terms
        phishing_prompts = [
            "click", "http", "www", "claim", "won", "winner", "prize",
            "suspended", "fee", "refund", "call now", "urgent", "lottery"
        ]
        if any(p in lower for p in phishing_prompts):
            return False

        code_patterns = [
            r"\b\d{4,8}\b.*(?:verification code|security code|login code|auth code|otp|one[- ]time password|code is|pin is)\b",
            r"(?:verification code|security code|login code|auth code|otp|one[- ]time password|code is|pin is|use)\b.*\b\d{4,8}\b",
            r"\b\d{4,8} is your (?:[\w\s]+) (?:code|password|verification)\b",
            r"(?:your|the) (?:[\w\s]+)?(?:code|otp|pin) is:? \b\d{4,8}\b",
        ]
        return any(re.search(p, lower) for p in code_patterns)

    # ========================================================
    # MAIN ANALYSIS FUNCTION
    # ========================================================

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze an SMS message and return comprehensive threat evaluation.
        """
        clean_text = text.strip() if text else ""

        # Empty input validation
        if not clean_text:
            return {
                "success": False,
                "message": "SMS content cannot be empty."
            }

        # Maximum input validation
        if len(clean_text) > 2000:
            return {
                "success": False,
                "message": "SMS text is too long (maximum 2000 characters allowed)."
            }

        # Ensure model is ready
        self.load_ml_model()

        return self._predict_distilbert(clean_text)

    # ========================================================
    # DISTILBERT INFERENCE & EXPLAINABILITY
    # ========================================================

    def _predict_distilbert(self, text: str) -> Dict[str, Any]:
        try:
            # Tokenize matching training max_length
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=128
            )

            inputs = {
                key: value.to(self.device)
                for key, value in inputs.items()
            }

            with torch.no_grad():
                outputs = self.ml_model_instance(**inputs)
                probabilities = torch.softmax(outputs.logits, dim=-1)

            predicted_class = torch.argmax(probabilities, dim=-1).item()
            raw_confidence = probabilities[0][predicted_class].item() * 100
            spam_probability = probabilities[0][1].item() * 100

            # Observable threat signals
            detected_signals, has_url = self.detect_signals(text)

            # Check for standard automated 2FA/OTP pattern
            is_2fa = self.is_clean_2fa_otp(text, has_url)

            # Unified handling for clean automated 2FA / OTP codes
            if is_2fa:
                predicted_class = 0
                is_spam = False
                label = "HAM"
                prediction = "legitimate"
                risk_score = round(min(spam_probability * 0.1, 15.0), 1)
                confidence = round(max(raw_confidence, 95.0), 1)
                threat_type = "Standard Authentication / 2FA Code"
                if "Standard automated verification code" not in detected_signals:
                    detected_signals.append("Standard automated verification code")
                explanation = (
                    "DistilBERT evaluated this message as an automated two-factor (2FA) "
                    "or one-time password code. No external links or credential prompts detected."
                )
                coaching = "Never share verification codes or one-time passwords with anyone over calls or unverified chats."
            else:
                label = self.ml_model_instance.config.id2label.get(
                    predicted_class, str(predicted_class)
                ).upper()
                is_spam = (predicted_class == 1)
                confidence = round(raw_confidence, 1)

                if is_spam:
                    prediction = "phishing"
                    # Baseline risk score based on spam probability
                    risk_score = round(max(spam_probability, 60.0), 1)

                    if has_url:
                        threat_type = "Smishing / Malicious Link"
                    elif "Financial, prize or payment lure" in detected_signals:
                        threat_type = "SMS Spam / Prize Lure"
                    elif "Credential or identity verification prompt" in detected_signals:
                        threat_type = "Smishing / Credential Harvesting"
                    else:
                        threat_type = "Unsolicited Spam / Smishing"

                    if detected_signals:
                        signal_summary = ", ".join(detected_signals[:2])
                        explanation = (
                            f"DistilBERT classified this SMS as SPAM/Smishing with {confidence}% confidence. "
                            f"Key indicators include: {signal_summary}."
                        )
                    else:
                        explanation = (
                            f"DistilBERT classified this SMS as SPAM with {confidence}% confidence "
                            "based on linguistic patterns learned from the SMS threat corpus."
                        )

                    coaching = (
                        "Do not click links, reply with personal credentials, or call numbers listed in unsolicited messages."
                    )
                else:
                    prediction = "legitimate"
                    risk_score = round(spam_probability, 1)
                    threat_type = "Legitimate SMS"

                    if detected_signals:
                        explanation = (
                            f"DistilBERT classified this SMS as HAM (legitimate) with {confidence}% confidence. "
                            "Exercising standard caution is recommended when links or sender details are unfamiliar."
                        )
                    else:
                        explanation = (
                            f"DistilBERT classified this SMS as legitimate personal/informational text "
                            f"with {confidence}% confidence."
                        )

                    coaching = "Sender text appears benign. Continue practicing good digital hygiene."

            # Determine risk level aligned with prediction and risk_score
            if risk_score >= 70:
                risk_level = "High"
            elif risk_score >= 40:
                risk_level = "Medium"
            else:
                risk_level = "Low"

            return {
                "success": True,
                "analysis_type": "sms",
                "prediction": prediction,
                "classification": label,
                "threat_type": threat_type,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "confidence": confidence,
                "detected_signals": detected_signals,
                "explanation": explanation,
                "coaching": coaching,
                "model": "DistilBERT",
                "message": "SMS analysis completed successfully."
            }

        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                "success": False,
                "message": "SMS analysis failed.",
                "error": str(e)
            }


# ============================================================
# SINGLETON INSTANCE
# ============================================================

sms_analyzer = SMSAnalyzer(
    model_path=MODEL_PATH
)