from flask import Blueprint, request, jsonify

from services.email_bert_service import email_bert_service


email_bp = Blueprint(
    "email",
    __name__,
    url_prefix="/api/scan"
)


@email_bp.route("/email", methods=["POST"])
def scan_email():

    try:

        # --------------------------------------------
        # Get JSON request
        # --------------------------------------------

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required."
            }), 400


        # --------------------------------------------
        # Get email text
        # --------------------------------------------

        email_text = data.get("text", "")

        if not isinstance(email_text, str):
            return jsonify({
                "success": False,
                "error": "Email text must be a string."
            }), 400

        email_text = email_text.strip()


        if not email_text:
            return jsonify({
                "success": False,
                "error": "Email text is required."
            }), 400


        # --------------------------------------------
        # BERT prediction
        # --------------------------------------------

        result = email_bert_service.predict(
            email_text
        )


        # --------------------------------------------
        # Risk calculation
        # --------------------------------------------

        if result["prediction"] == "PHISHING":

            risk_score = result["confidence"]
            risk_level = "HIGH"

        else:

            # For now, use the phishing probability
            # as the risk score.

            risk_score = 100 - result["confidence"]
            risk_level = "LOW"


        # --------------------------------------------
        # API response
        # --------------------------------------------

        return jsonify({

            "success": True,

            "prediction": result["prediction"],

            "prediction_id": result["prediction_id"],

            "confidence": result["confidence"],

            "risk_score": round(
                risk_score,
                2
            ),

            "risk_level": risk_level

        }), 200


    except ValueError as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


    except Exception as e:

        print("Email scan error:", str(e))

        return jsonify({
            "success": False,
            "error": "Email analysis failed."
        }), 500