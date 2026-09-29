import os
import re
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "Models - Email feature",
    "BERT_Email_Model"
)


# ============================================================
# LABEL MAPPING
# ============================================================

LABELS = {
    0: "LEGITIMATE",
    1: "PHISHING"
}


# ============================================================
# EMAIL BERT ANALYZER
# ============================================================

class EmailAnalyzer:

    def __init__(self):

        print("\n========================================")
        print("       Loading Email BERT Model")
        print("========================================")

        self.device = torch.device("cpu")

        print("Model path:")
        print(MODEL_PATH)

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Email BERT model not found:\n{MODEL_PATH}"
            )

        # ----------------------------------------------------
        # Load tokenizer
        # ----------------------------------------------------

        print("\nLoading tokenizer...")

        self.tokenizer = AutoTokenizer.from_pretrained(
            MODEL_PATH,
            local_files_only=True
        )

        print("Tokenizer loaded successfully.")

        # ----------------------------------------------------
        # Load trained BERT model
        # ----------------------------------------------------

        print("\nLoading BERT model...")

        self.model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_PATH,
            local_files_only=True
        )

        self.model.to(self.device)
        self.model.eval()

        print("BERT model loaded successfully.")
        print("Device:", self.device)
        print("Labels:", LABELS)

        print("========================================\n")


    # ========================================================
    # BERT PREDICTION
    # ========================================================

    def predict(self, email_text):

        if not email_text:
            raise ValueError("Email content cannot be empty.")

        email_text = email_text.strip()

        if not email_text:
            raise ValueError("Email content cannot be empty.")

        # ----------------------------------------------------
        # Tokenization
        # ----------------------------------------------------

        inputs = self.tokenizer(
            email_text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=128
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        with torch.no_grad():

            outputs = self.model(**inputs)

            probabilities = torch.softmax(
                outputs.logits,
                dim=1
            )

            prediction_id = torch.argmax(
                probabilities,
                dim=1
            ).item()

            confidence = probabilities[
                0,
                prediction_id
            ].item()

        prediction = LABELS.get(
            prediction_id,
            "UNKNOWN"
        )

        return {
            "prediction": prediction,
            "prediction_id": prediction_id,
            "confidence": round(confidence * 100, 2)
        }


    # ========================================================
    # SECURITY SIGNAL DETECTION
    # ========================================================

    def detect_signals(self, email_text):

        text = email_text.lower()

        signals = []

        # Urgency
        urgency_patterns = [
            r"\burgent\b",
            r"\bimmediately\b",
            r"\baction required\b",
            r"\bact now\b",
            r"\bwithin \d+ hours?\b",
            r"\bexpires?\b",
            r"\bfinal warning\b"
        ]

        if any(re.search(pattern, text) for pattern in urgency_patterns):
            signals.append("Urgency or pressure language")

        # Credential requests
        credential_patterns = [
            r"\bpassword\b",
            r"\blogin\b",
            r"\bsign in\b",
            r"\bverify your account\b",
            r"\bverification\b",
            r"\bcredentials?\b",
            r"\bsecurity code\b",
            r"\bone[- ]time password\b",
            r"\botp\b"
        ]

        if any(re.search(pattern, text) for pattern in credential_patterns):
            signals.append("Credential or account verification request")

        # Financial / payment requests
        financial_patterns = [
            r"\bpayment\b",
            r"\brefund\b",
            r"\binvoice\b",
            r"\bbank\b",
            r"\bcredit card\b",
            r"\bdebit card\b",
            r"\bwire transfer\b",
            r"\btransaction\b",
            r"\bprize\b",
            r"\breward\b"
        ]

        if any(re.search(pattern, text) for pattern in financial_patterns):
            signals.append("Financial or reward-related content")

        # Suspicious links
        url_pattern = r"https?://\S+|www\.\S+"

        if re.search(url_pattern, text):
            signals.append("Contains a link")

        # Attachment references
        attachment_patterns = [
            r"\battachment\b",
            r"\battached file\b",
            r"\bopen the file\b",
            r"\bdownload the file\b"
        ]

        if any(re.search(pattern, text) for pattern in attachment_patterns):
            signals.append("Attachment or file reference")

        # Impersonation
        impersonation_patterns = [
            r"\bdear customer\b",
            r"\bdear user\b",
            r"\bsupport team\b",
            r"\baccount team\b",
            r"\bsecurity team\b",
            r"\badmin\b",
            r"\badministrator\b"
        ]

        if any(re.search(pattern, text) for pattern in impersonation_patterns):
            signals.append("Possible organization impersonation")

        return signals


    # ========================================================
    # MAIN ANALYSIS METHOD
    # ========================================================

    def analyze(self, email_text):

        if not email_text:
            raise ValueError("Email content cannot be empty.")

        email_text = email_text.strip()

        if not email_text:
            raise ValueError("Email content cannot be empty.")

        # ----------------------------------------------------
        # Run BERT
        # ----------------------------------------------------

        prediction_result = self.predict(email_text)

        prediction = prediction_result["prediction"]
        confidence = prediction_result["confidence"]

        # ----------------------------------------------------
        # Detect additional security signals
        # ----------------------------------------------------

        detected_signals = self.detect_signals(email_text)

        # ----------------------------------------------------
        # Calculate risk score
        # ----------------------------------------------------
        #
        # PHISHING:
        #     BERT confidence directly represents phishing risk.
        #
        # LEGITIMATE:
        #     Risk is based on the probability that the model
        #     assigned to phishing.
        #
        # ----------------------------------------------------

        if prediction == "PHISHING":
            risk_score = confidence
            risk_level = "HIGH" if confidence >= 70 else "MEDIUM"

        else:
            risk_score = 100 - confidence

            if risk_score >= 70:
                risk_level = "HIGH"
            elif risk_score >= 40:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

        # ----------------------------------------------------
        # Small signal adjustment
        # ----------------------------------------------------
        #
        # BERT remains the primary classifier.
        # Security signals only provide supporting context.
        #

        if prediction == "PHISHING" and detected_signals:

            risk_score = min(
                100,
                round(
                    risk_score + min(5, len(detected_signals)),
                    2
                )
            )

        elif prediction == "LEGITIMATE" and detected_signals:

            risk_score = min(
                100,
                round(
                    risk_score + min(10, len(detected_signals) * 2),
                    2
                )
            )

        # Recalculate level after adjustment
        if risk_score >= 70:
            risk_level = "HIGH"
        elif risk_score >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # ----------------------------------------------------
        # Explanation
        # ----------------------------------------------------

        if prediction == "PHISHING":

            explanation = (
                "The BERT email classification model identified "
                "this message as potentially phishing."
            )

            if detected_signals:
                explanation += (
                    " Supporting indicators were also detected."
                )

        else:

            explanation = (
                "The BERT email classification model identified "
                "this message as legitimate."
            )

            if detected_signals:
                explanation += (
                    " However, some potentially sensitive email "
                    "patterns were detected, so caution is advised."
                )

        # ----------------------------------------------------
        # Personalized cyber coaching
        # ----------------------------------------------------

        if prediction == "PHISHING":

            coaching = (
                "Do not click links, open unexpected attachments, "
                "or provide passwords, OTPs, or financial information. "
                "Verify the sender through an independent communication "
                "channel before taking action."
            )

        elif risk_score >= 40:

            coaching = (
                "Review the sender address and any links or attachments "
                "carefully. Avoid sharing credentials until the message "
                "is independently verified."
            )

        else:

            coaching = (
                "The email appears legitimate based on the current model "
                "analysis. Continue checking the sender, links, and "
                "attachments before taking sensitive actions."
            )

        # ----------------------------------------------------
        # Final response
        # ----------------------------------------------------

        return {
            "prediction": prediction,
            "prediction_id": prediction_result["prediction_id"],
            "confidence": confidence,
            "risk_score": round(risk_score),
            "risk_level": risk_level,
            "detected_signals": detected_signals,
            "explanation": explanation,
            "coaching": coaching,
            "model_name": "BERT",
            "inputSummary": (
                email_text[:180] +
                ("..." if len(email_text) > 180 else "")
            )
        }


# ============================================================
# LOAD MODEL ONCE
# ============================================================

email_analyzer = EmailAnalyzer()