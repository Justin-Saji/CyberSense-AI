"""
SMS Analyzer Service Module for CyberSense AI
==============================================
Provides modular architecture for SMS phishing detection.
Currently implements a rule-based/heuristic analysis engine ("model": "heuristic")
with a clean interface designed to plug in trained ML / Transformer models (e.g., DistilBERT) seamlessly.
"""

import re
from typing import Dict, Any, List, Optional


class SMSAnalyzer:
    """
    Modular SMS Analyzer Service.
    
    Architecture Design:
    - `model_type` defaults to "heuristic".
    - When your ML/Transformer model (e.g. DistilBERT) is trained, pass `model_type="DistilBERT"`
      or load weights via `load_ml_model()` to switch execution automatically.
    """
    
    def __init__(self, model_type: str = "heuristic"):
        self.model_type = model_type
        self.ml_model_instance = None

    def load_ml_model(self, model_path_or_name: str):
        """
        Plug in trained ML / Transformer model weights (e.g. DistilBERT).
        Example usage:
            sms_analyzer.load_ml_model("path/to/distilbert_sms_phishing_model")
        """
        # Placeholder for loading PyTorch / HuggingFace Transformers model
        # from transformers import AutoTokenizer, AutoModelForSequenceClassification
        # self.tokenizer = AutoTokenizer.from_pretrained(model_path_or_name)
        # self.ml_model_instance = AutoModelForSequenceClassification.from_pretrained(model_path_or_name)
        self.model_type = "DistilBERT"

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Main entrypoint for SMS text analysis.
        
        Input:
            text (str): The SMS text entered by the user.
            
        Output:
            dict containing standard CyberSense AI response format.
        """
        clean_text = text.strip() if text else ""
        
        if not clean_text:
            return {
                "success": False,
                "message": "SMS content cannot be empty."
            }

        if len(clean_text) > 2000:
            return {
                "success": False,
                "message": "SMS text is too long (maximum 2000 characters allowed)."
            }

        if self.model_type == "DistilBERT" and self.ml_model_instance is not None:
            return self._predict_distilbert(clean_text)
        else:
            return self._predict_heuristic(clean_text)

    def _predict_heuristic(self, text: str) -> Dict[str, Any]:
        """
        Rule-based heuristic risk engine.
        Identifies urgency language, credential harvesting, financial lures,
        and suspicious link patterns.
        """
        lowered = text.lower()
        detected_signals: List[str] = []
        score = 5

        rules = [
            ("Urgent call-to-action language", ["urgent", "immediately", "limited time", "act now", "action required", "asap", "24 hours", "expires today"], 25),
            ("Credential/identity verification request", ["verify", "password", "otp", "pin", "account", "login", "authenticate", "confirm identity"], 25),
            ("Financial/prize/reward lure", ["bank", "card", "payment", "refund", "prize", "winner", "reward", "cash", "crypto", "dollars", "$"], 20),
            ("Suspicious link / shortened URL", ["http://", "https://", "bit.ly", "tinyurl", "goo.gl", "t.co", "is.gd", ".xyz", ".top", ".click"], 25),
            ("Account security threat", ["blocked", "suspended", "locked", "unauthorized", "compromised", "security alert"], 15),
            ("Impersonation / claim prompt", ["reply stop", "claim now", "text back", "congratulations", "free gift"], 10)
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
            confidence = min(80.0 + (risk_score - 60) * 0.45, 98.5)
        elif risk_score >= 35:
            prediction = "phishing"
            risk_level = "Medium"
            confidence = 72.0
        else:
            prediction = "legitimate"
            risk_level = "Low"
            confidence = min(85.0 + (35 - risk_score) * 0.4, 99.0)

        if detected_signals:
            explanation = f"Detected {len(detected_signals)} suspicious smishing indicator(s): " + ", ".join(detected_signals) + "."
        else:
            explanation = "No common SMS phishing keywords or suspicious link patterns were detected in the text."

        return {
            "success": True,
            "analysis_type": "sms",
            "prediction": prediction,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "confidence": round(confidence, 1),
            "detected_signals": detected_signals,
            "explanation": explanation,
            "model": "heuristic",
            "message": "SMS analysis completed successfully."
        }

    def _predict_distilbert(self, text: str) -> Dict[str, Any]:
        """
        Placeholder for DistilBERT transformer model prediction.
        Ready to execute PyTorch inference when weights are loaded.
        """
        # Example implementation when model is loaded:
        # inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        # outputs = self.ml_model_instance(**inputs)
        # probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        # ...
        raise NotImplementedError("DistilBERT model weights not yet loaded. Using heuristic engine.")


# Export default singleton instance
sms_analyzer = SMSAnalyzer(model_type="heuristic")
