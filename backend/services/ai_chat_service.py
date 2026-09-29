import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables to ensure API key is available
SERVICE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SERVICE_DIR.parent
load_dotenv(os.path.join(BACKEND_DIR, ".env"))


def generate_fallback_cybersecurity_response(prompt: str) -> str:
    prompt_lower = (prompt or "").lower().strip()

    if any(k in prompt_lower for k in ["phishing", "email scam", "sms scam", "smishing", "fake message", "spam"]):
        return (
            "### 🛡️ Understanding & Preventing Phishing Scams\n\n"
            "Phishing is a social engineering attack where attackers impersonate trusted institutions to steal sensitive data such as login credentials, personal data, or credit card details.\n\n"
            "**Key Indicators of Phishing:**\n"
            "- **Urgent Language:** Demands immediate action (e.g., *'Your account will be suspended in 24 hours'*).\n"
            "- **Suspicious Senders:** Mismatched email domains or non-official numbers.\n"
            "- **Unfamiliar Links:** Hyperlinks leading to suspicious or lookalike domain names.\n"
            "- **Generic Greetings:** Using *'Dear Customer'* instead of your full name.\n\n"
            "**Recommended Protective Steps:**\n"
            "1. Do not click links or open attachments in unsolicited messages.\n"
            "2. Use CyberSense AI's **SMS Phishing** or **Email Phishing** module on your dashboard to scan questionable messages.\n"
            "3. Verify requests directly with the official organization via known contact channels."
        )

    elif any(k in prompt_lower for k in ["password", "passphrase", "credentials", "2fa", "mfa", "auth", "login"]):
        return (
            "### 🔑 Password & Authentication Best Practices\n\n"
            "Securing your login credentials is fundamental to protecting your CyberSense AI account and personal data.\n\n"
            "**Key Security Guidelines:**\n"
            "- **Use Unique Passwords:** Avoid reusing passwords across different sites.\n"
            "- **Adopt Long Passphrases:** Use 12–16+ characters combining uppercase, lowercase, numbers, and special symbols.\n"
            "- **Enable Multi-Factor Authentication (MFA):** Use authenticator apps (e.g., Google Authenticator) for an extra layer of protection.\n"
            "- **Use a Password Manager:** Store complex passwords safely inside an encrypted password vault.\n\n"
            "You can review and update your security settings under the **Profile** tab in CyberSense AI."
        )

    elif any(k in prompt_lower for k in ["url", "link", "website", "domain", "scan", "site", "web"]):
        return (
            "### 🌐 Malicious URL & Website Security\n\n"
            "Cybercriminals use fraudulent websites and malicious URLs to deliver malware, steal credentials, or execute drive-by downloads.\n\n"
            "**Safety Verification Tips:**\n"
            "- **Check for Typosquatting:** Watch out for subtle spelling tricks (e.g., `g00gle.com` or `paypa1-verify.com`).\n"
            "- **Verify Protocol:** Confirm the website uses secure `HTTPS` encryption with a valid SSL certificate.\n"
            "- **Scan URLs before visiting:** Paste any suspicious link into the **URL Scanner** module on CyberSense AI to check its threat level."
        )

    elif any(k in prompt_lower for k in ["malware", "virus", "ransomware", "trojan", "spyware"]):
        return (
            "### 🦠 Malware & Ransomware Protection\n\n"
            "Malware is malicious software designed to compromise computers, encrypt files, or monitor user activities.\n\n"
            "**Best Defense Strategies:**\n"
            "- Keep your operating system, web browsers, and applications updated to patch security vulnerabilities.\n"
            "- Never execute unknown `.exe`, `.scr`, or `.bat` files received via email or untrusted websites.\n"
            "- Maintain regular, automated backups stored offline or in secure cloud storage.\n"
            "- Keep active endpoint antivirus protection enabled on all your devices."
        )

    elif any(k in prompt_lower for k in ["tip", "advice", "best practice", "guide", "help", "feature", "cybersense"]):
        return (
            "### 🔒 Essential Cybersecurity Practices\n\n"
            "1. **Analyze Suspicious Content:** Always run questionable text messages, emails, or links through CyberSense AI modules.\n"
            "2. **Enable Multi-Factor Authentication:** Safeguard your online accounts with MFA.\n"
            "3. **Keep Software Patched:** Promptly install security updates for your OS and apps.\n"
            "4. **Be Wary of Urgent Requests:** Legitimate organizations rarely demand emergency credential updates via text or email.\n"
            "5. **Monitor Risk Scores:** Check your Security Dashboard regularly for risk insights and security recommendations."
        )

    elif any(k in prompt_lower for k in ["hello", "hi", "hey", "greetings", "who are you", "what can you do"]):
        return (
            "Hello! 👋 I am **CyberSense AI Assistant**, your dedicated cybersecurity AI guide.\n\n"
            "I can assist you with:\n"
            "- Explaining security threats like phishing, ransomware, and malicious URLs\n"
            "- Password hygiene and account security recommendations\n"
            "- Guidance on using CyberSense AI detection tools\n"
            "- Best practices for keeping your digital assets safe\n\n"
            "How can I help protect your digital presence today?"
        )

    else:
        return (
            f"### 🛡️ Cybersecurity Guidance\n\n"
            f"Regarding your query about **\"{prompt}\"**:\n\n"
            "CyberSense AI recommends observing core security hygiene to keep your digital identity secure:\n"
            "- **Verify Communication:** Confirm the identity of any unverified senders before clicking links or downloading attachments.\n"
            "- **Strengthen Authentication:** Use long, unique passwords combined with Multi-Factor Authentication (MFA).\n"
            "- **Scan Threat Vectors:** Use our **SMS**, **Email**, and **URL** scanners available on the CyberSense AI platform.\n\n"
            "Feel free to ask more specific questions about phishing detection, password security, malware prevention, or platform features!"
        )


class AIChatService:
    def __init__(self):
        self.system_prompt = (
            "You are CyberSense AI Assistant, an AI-powered cybersecurity assistant integrated into the CyberSense AI platform. "
            "Your job is to help users understand cybersecurity threats, analyze security information, explain CyberSense AI results, "
            "and provide practical defensive recommendations."
        )

    def get_chat_response(self, conversation):
        # Extract last user message for fallback
        last_user_prompt = "Cybersecurity advice"
        if isinstance(conversation, list):
            for msg in reversed(conversation):
                if isinstance(msg, dict) and msg.get("role") == "user" and msg.get("content"):
                    last_user_prompt = str(msg["content"])
                    break

        api_key = os.getenv("GROQ_API_KEY")
        model = os.getenv("GROQ_MODEL", "groq/compound")

        if api_key and len(api_key.strip()) > 5:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key.strip()}",
                "Content-Type": "application/json"
            }

            messages = [{"role": "system", "content": self.system_prompt}]
            for msg in conversation:
                if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                    if msg['role'] in ['user', 'assistant']:
                        messages.append({
                            "role": msg['role'],
                            "content": str(msg['content'])
                        })

            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 400
            }

            try:
                response = requests.post(url, headers=headers, json=payload, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if reply and reply.strip():
                        return {"success": True, "response": reply.strip()}
            except Exception as e:
                print(f"Groq API call exception: {e}")

        # Fallback to local intelligent cybersecurity assistant (always returns success)
        reply = generate_fallback_cybersecurity_response(last_user_prompt)
        return {"success": True, "response": reply}


ai_chat_service = AIChatService()
