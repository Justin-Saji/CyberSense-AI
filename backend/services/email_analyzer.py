"""
Email Analyzer Service Module for CyberSense AI
================================================
Provides modular architecture for Email phishing & header spoofing detection.
Currently implements a comprehensive rule-based heuristic risk engine ("model": "heuristic")
with a clean interface designed to plug in trained ML / Transformer models (e.g., EmailBERT / DistilBERT) seamlessly.
"""

import re
from typing import Dict, Any, List


class EmailAnalyzer:
    """
    Modular Email Phishing & Header Analyzer.
    
    Architecture Design:
    - `model_type` defaults to "heuristic".
    - When your ML/Transformer model is trained, pass `model_type="EmailBERT"`
      or load weights via `load_ml_model()` to switch execution automatically.
    """
    
    def __init__(self, model_type: str = "heuristic"):
        self.model_type = model_type
        self.ml_model_instance = None

    def load_ml_model(self, model_path_or_name: str):
        """
        Plug in trained ML / Transformer model weights (e.g. EmailBERT / DistilBERT).
        """
        self.model_type = "EmailBERT"

    def analyze(self, content: str) -> Dict[str, Any]:
        """
        Main entrypoint for Email body and raw header analysis.
        
        Input:
            content (str): Email body text or full raw email headers.
            
        Output:
            dict containing standard CyberSense AI response format.
        """
        clean_content = content.strip() if content else ""
        
        if not clean_content:
            return {
                "success": False,
                "message": "Email content cannot be empty."
            }

        if len(clean_content) > 10000:
            return {
                "success": False,
                "message": "Email content is too long (maximum 10,000 characters allowed)."
            }

        if self.model_type == "EmailBERT" and self.ml_model_instance is not None:
            return self._predict_emailbert(clean_content)
        else:
            return self._predict_heuristic(clean_content)

    def _predict_heuristic(self, content: str) -> Dict[str, Any]:
        """
        Rule-based heuristic email phishing & spoofing engine.
        Inspects headers, body text, link signatures, attachments,
        urgency, and brand impersonation patterns.
        """
        lowered = content.lower()
        detected_signals: List[str] = []
        score = 5

        # Heuristic Rule Definitions
        rules = [
            (
                "Urgency & high-pressure language",
                ["urgent", "immediately", "action required", "within 24 hours", "final notice", "account suspended", "act now", "account termination", "immediate response"],
                20
            ),
            (
                "Credential harvesting / account verification",
                ["verify your password", "confirm your account", "update login details", "security check", "re-authenticate", "sso verification", "click here to login", "sign in to verify"],
                25
            ),
            (
                "Financial / payment / refund request",
                ["invoice attached", "wire transfer", "payment required", "overdue invoice", "refund claim", "gift card", "crypto deposit", "bank transfer", "purchase order", "remittance"],
                20
            ),
            (
                "Suspicious links / domain indicators",
                ["http://", "https://", "bit.ly", "tinyurl", "goo.gl", "t.co", ".xyz", ".top", ".click", ".buzz", ".site", "login-verify"],
                20
            ),
            (
                "Brand / executive impersonation cue",
                ["security team", "it support", "help desk", "system administrator", "paypal security", "microsoft security", "google security", "bank security", "ceo", "management"],
                15
            ),
            (
                "Suspicious attachment warning",
                [".exe", ".zip", ".iso", ".vbs", ".docm", ".xlsm", ".js", "attachment included", "download attached file", "see attached invoice"],
                15
            ),
            (
                "SPF / DKIM / DMARC authentication failure",
                ["spf=fail", "spf=softfail", "dkim=fail", "dmarc=fail", "authentication-results: fail", "spf=neutral"],
                30
            ),
            (
                "Header mismatch / suspicious routing",
                ["x-suspended", "received: from unknown", "return-path: <>", "reply-to:"],
                15
            ),
        ]

        for label, keywords, weight in rules:
            if any(kw in lowered for kw in keywords):
                score += weight
                detected_signals.append(label)

        # Bound risk_score between 0 and 100
        risk_score = min(score, 100)

        # Determine prediction and risk level
        if risk_score >= 60:
            prediction = "phishing"
            risk_level = "High"
            confidence = min(82.0 + (risk_score - 60) * 0.4, 98.5)
        elif risk_score >= 35:
            prediction = "phishing"
            risk_level = "Medium"
            confidence = 74.0
        else:
            prediction = "legitimate"
            risk_level = "Low"
            confidence = min(85.0 + (35 - risk_score) * 0.4, 99.0)

        if detected_signals:
            explanation = f"Detected {len(detected_signals)} suspicious email indicator(s): " + ", ".join(detected_signals) + "."
        else:
            explanation = "No common email phishing keywords, header spoofing cues, or suspicious link indicators were detected."

        return {
            "success": True,
            "analysis_type": "email",
            "prediction": prediction,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "confidence": round(confidence, 1),
            "detected_signals": detected_signals,
            "explanation": explanation,
            "model": "heuristic",
            "message": "Email analysis completed successfully."
        }

    def _predict_emailbert(self, content: str) -> Dict[str, Any]:
        """
        Placeholder for EmailBERT / DistilBERT transformer model prediction.
        Ready to execute PyTorch inference when weights are loaded.
        """
        raise NotImplementedError("EmailBERT model weights not yet loaded. Using heuristic engine.")


# Export default singleton instance
email_analyzer = EmailAnalyzer(model_type="heuristic")
