import os
import joblib


# ============================================================
# PATH CONFIGURATION
# ============================================================

# Current file:
# backend/services/url_analyzer.py
#
# Go one level up:
# backend/

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "rf_reg08_model.pkl"
)

VECTORIZER_PATH = os.path.join(
    BASE_DIR,
    "rf_reg08_tfidf_vectorizer.pkl"
)


# ============================================================
# LOAD RANDOM FOREST MODEL
# ============================================================

try:

    model = joblib.load(MODEL_PATH)

    print("[URL] Random Forest RF_Reg_08 model loaded successfully.")

except Exception as e:

    model = None

    print(
        f"[URL] ERROR loading Random Forest model: {e}"
    )


# ============================================================
# LOAD TF-IDF VECTORIZER
# ============================================================

try:

    vectorizer = joblib.load(VECTORIZER_PATH)

    print("[URL] URL TF-IDF vectorizer loaded successfully.")

except Exception as e:

    vectorizer = None

    print(
        f"[URL] ERROR loading TF-IDF vectorizer: {e}"
    )


# ============================================================
# URL ANALYZER
# ============================================================

def url_analyzer(url):
    """
    Analyze a URL using the trained RF_Reg_08 model.

    Pipeline:

        URL
         ↓
        TF-IDF Character N-Grams
         ↓
        Random Forest RF_Reg_08
         ↓
        Prediction + Probability
         ↓
        Risk Score
    """

    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if model is None:

        raise RuntimeError(
            "URL threat detection model is not loaded."
        )

    # --------------------------------------------------------
    # Check vectorizer
    # --------------------------------------------------------

    if vectorizer is None:

        raise RuntimeError(
            "URL TF-IDF vectorizer is not loaded."
        )

    # --------------------------------------------------------
    # Validate URL
    # --------------------------------------------------------

    if url is None:

        raise ValueError(
            "URL is required."
        )

    if not isinstance(url, str):

        raise ValueError(
            "URL must be a string."
        )

    url = url.strip()

    if not url:

        raise ValueError(
            "URL cannot be empty."
        )

    # --------------------------------------------------------
    # TF-IDF Transformation
    # --------------------------------------------------------

    features = vectorizer.transform([url])

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction = model.predict(features)[0]

    # --------------------------------------------------------
    # Prediction Probability
    # --------------------------------------------------------

    probabilities = model.predict_proba(features)[0]

    legitimate_probability = float(
        probabilities[0]
    )

    phishing_probability = float(
        probabilities[1]
    )

    # --------------------------------------------------------
    # Determine Verdict
    # --------------------------------------------------------

    if int(prediction) == 1:

        verdict = "PHISHING"

        confidence = phishing_probability * 100

    else:

        verdict = "LEGITIMATE"

        confidence = legitimate_probability * 100

    # --------------------------------------------------------
    # Risk Score
    #
    # Risk score represents the probability that
    # the URL belongs to the phishing class.
    # --------------------------------------------------------

    risk_score = phishing_probability * 100

    # --------------------------------------------------------
    # Risk Level
    # --------------------------------------------------------

    if risk_score >= 70:

        risk_level = "HIGH"

    elif risk_score >= 40:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"

    # --------------------------------------------------------
    # Return Result
    # --------------------------------------------------------

    return {
        "url": url,
        "prediction": int(prediction),
        "verdict": verdict,
        "confidence": round(confidence, 2),
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "phishing_probability": round(
            phishing_probability * 100,
            2
        ),
        "legitimate_probability": round(
            legitimate_probability * 100,
            2
        )
    }