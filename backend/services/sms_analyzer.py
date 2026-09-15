"""
SMS Analyzer Service Module for CyberSense AI
==============================================

Uses the locally trained DistilBERT model for SMS spam/phishing detection.

Model:
    DistilBERT Sequence Classification

Training Labels:
    0 = HAM
    1 = SPAM

Important:
    The model prediction is based entirely on the trained
    DistilBERT model. No keyword/rule-based detection is used.
"""

import os
from pathlib import Path
from typing import Dict, Any

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

    The final classification is produced entirely by the
    trained DistilBERT model.
    """

    def __init__(self, model_path: str):

        self.model_path = model_path
        self.tokenizer = None
        self.ml_model_instance = None

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.load_ml_model()

    # ========================================================
    # LOAD DISTILBERT MODEL
    # ========================================================

    def load_ml_model(self):
        """
        Load the trained DistilBERT tokenizer and model.
        """

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"DistilBERT model directory not found: {self.model_path}"
            )

        print("=" * 60)
        print("Loading CyberSense AI SMS DistilBERT model...")
        print(f"Model path: {self.model_path}")
        print(f"Device: {self.device}")
        print("=" * 60)

        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_path
        )

        # Load trained model
        self.ml_model_instance = (
            AutoModelForSequenceClassification.from_pretrained(
                self.model_path
            )
        )

        # Move model to CPU/GPU
        self.ml_model_instance.to(self.device)

        # Evaluation mode
        self.ml_model_instance.eval()

        print("DistilBERT SMS model loaded successfully.")

        print(
            f"Model labels: {self.ml_model_instance.config.id2label}"
        )

        print("=" * 60)

    # ========================================================
    # MAIN ANALYSIS FUNCTION
    # ========================================================

    def analyze(self, text: str) -> Dict[str, Any]:

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
                "message": (
                    "SMS text is too long "
                    "(maximum 2000 characters allowed)."
                )
            }

        # Send directly to DistilBERT
        return self._predict_distilbert(clean_text)

    # ========================================================
    # DISTILBERT PREDICTION
    # ========================================================

    def _predict_distilbert(self, text: str) -> Dict[str, Any]:

        try:

            # ------------------------------------------------
            # TOKENIZATION
            # ------------------------------------------------

            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=512
            )

            # Move tensors to selected device
            inputs = {
                key: value.to(self.device)
                for key, value in inputs.items()
            }

            # ------------------------------------------------
            # MODEL INFERENCE
            # ------------------------------------------------

            with torch.no_grad():

                outputs = self.ml_model_instance(**inputs)

                probabilities = torch.softmax(
                    outputs.logits,
                    dim=-1
                )

            # ------------------------------------------------
            # PREDICTED CLASS
            # ------------------------------------------------

            predicted_class = torch.argmax(
                probabilities,
                dim=-1
            ).item()

            # ------------------------------------------------
            # MODEL CONFIDENCE
            # ------------------------------------------------

            confidence = (
                probabilities[0][predicted_class].item() * 100
            )

            # ------------------------------------------------
            # LABEL
            # ------------------------------------------------

            label = self.ml_model_instance.config.id2label.get(
                predicted_class,
                str(predicted_class)
            )

            label = label.upper()

            # ------------------------------------------------
            # SPAM PROBABILITY
            # ------------------------------------------------

            spam_probability = (
                probabilities[0][1].item() * 100
            )

            spam_probability = round(
                spam_probability,
                1
            )

            # ------------------------------------------------
            # CLASSIFICATION
            # ------------------------------------------------

            is_spam = label == "SPAM"

            if is_spam:

                prediction = "phishing"

            else:

                prediction = "legitimate"

            # ------------------------------------------------
            # RISK SCORE
            #
            # Risk score represents the probability that
            # the model assigns to the SPAM class.
            # ------------------------------------------------

            risk_score = spam_probability

            # ------------------------------------------------
            # RISK LEVEL
            # ------------------------------------------------

            if risk_score >= 70:

                risk_level = "High"

            elif risk_score >= 40:

                risk_level = "Medium"

            else:

                risk_level = "Low"

            # ------------------------------------------------
            # EXPLANATION
            # ------------------------------------------------

            if is_spam:

                explanation = (
                    "The trained DistilBERT model classified "
                    "this SMS as SPAM based on patterns learned "
                    "from the SMS training dataset."
                )

            else:

                explanation = (
                    "The trained DistilBERT model classified "
                    "this SMS as HAM (legitimate/non-spam) "
                    "based on patterns learned from the SMS "
                    "training dataset."
                )

            # ------------------------------------------------
            # FINAL RESPONSE
            # ------------------------------------------------

            return {

                "success": True,

                "analysis_type": "sms",

                "prediction": prediction,

                "classification": label,

                "risk_level": risk_level,

                "risk_score": risk_score,

                "confidence": round(
                    confidence,
                    1
                ),

                # No manually defined keyword rules
                "detected_signals": [],

                "explanation": explanation,

                "model": "DistilBERT",

                "message": (
                    "SMS analysis completed successfully."
                )
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