"""
Notification Service Module for CyberSense AI
==============================================
Centralized service for enforcing user notification & privacy settings rules
before dispatching security alerts, phishing alerts, account activity emails,
AI recommendations, or marketing opt-in confirmation emails via Flask-Mail.
"""

import sys
from typing import Optional


def get_user_settings_helper(user_id: int):
    """
    Safely retrieves or creates user settings using the active main module instance.
    Prevents duplicate app module imports and SQLAlchemy instance conflicts.
    """
    main_module = sys.modules.get("__main__")
    if main_module and hasattr(main_module, "get_or_create_user_settings"):
        return main_module.get_or_create_user_settings(user_id)
    from app import get_or_create_user_settings
    return get_or_create_user_settings(user_id)


def send_notification_email(mail, sender: str, recipient: str, subject: str, body: str) -> bool:
    """
    Executes raw Flask-Mail delivery with exception handling.
    Returns True if sent successfully, False otherwise.
    """
    if not recipient or not mail:
        return False

    try:
        from flask_mail import Message
        msg = Message(
            subject=subject,
            recipients=[recipient],
            sender=sender or "noreply@cybersense.ai",
            body=body
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"[NotificationService] Failed to send email to {recipient}: {e}")
        return False


class NotificationService:
    def __init__(self, app=None, mail=None):
        self.app = app
        self.mail = mail

    def init_app(self, app, mail):
        self.app = app
        self.mail = mail

    def notify_account_activity(self, user, activity_name: str, details: str = "") -> bool:
        """
        Sends an email when security-relevant account activity occurs if:
        email_notifications == True AND account_activity == True.
        """
        if not user or not user.email or not self.mail or not self.app:
            return False

        with self.app.app_context():
            settings = get_user_settings_helper(user.id)

            if not settings or not settings.email_notifications or not settings.account_activity:
                return False

            subject = "CyberSense AI - New Account Activity"
            body = (
                f"Hello {user.name},\n\n"
                f"A new security-related activity was detected on your CyberSense AI account.\n\n"
                f"Activity:\n{activity_name}\n"
                f"{f'Details: {details}\n' if details else ''}\n"
                f"If this was not you, please secure your account immediately.\n\n"
                f"CyberSense AI Security Team"
            )

            sender = self.app.config.get("MAIL_DEFAULT_SENDER") or "noreply@cybersense.ai"
            return send_notification_email(self.mail, sender, user.email, subject, body)

    def notify_security_alert(self, user, subject: str, message: str) -> bool:
        """
        Sends security alert email if:
        email_notifications == True AND security_alerts == True.
        """
        if not user or not user.email or not self.mail or not self.app:
            return False

        with self.app.app_context():
            settings = get_user_settings_helper(user.id)

            if not settings or not settings.email_notifications or not settings.security_alerts:
                return False

            full_subject = f"CyberSense AI Security Alert: {subject}"
            body = (
                f"Hello {user.name},\n\n"
                f"SECURITY ALERT:\n{message}\n\n"
                f"Please review your account security dashboard immediately.\n\n"
                f"CyberSense AI Security Team"
            )

            sender = self.app.config.get("MAIL_DEFAULT_SENDER") or "noreply@cybersense.ai"
            return send_notification_email(self.mail, sender, user.email, full_subject, body)

    def notify_phishing_alert(self, user, threat_type: str, details: str) -> bool:
        """
        Sends phishing alert email if:
        email_notifications == True AND phishing_alerts == True.
        """
        if not user or not user.email or not self.mail or not self.app:
            return False

        with self.app.app_context():
            settings = get_user_settings_helper(user.id)

            if not settings or not settings.email_notifications or not settings.phishing_alerts:
                return False

            subject = f"CyberSense AI Warning: High-Risk {threat_type.upper()} Threat Detected"
            body = (
                f"Hello {user.name},\n\n"
                f"HIGH THREAT WARNING:\n"
                f"CyberSense AI detected a high-risk {threat_type.upper()} threat during your recent scan.\n\n"
                f"Summary: {details}\n\n"
                f"Recommendation: Do not interact with unverified links, senders, or attachments.\n\n"
                f"CyberSense AI Threat Intelligence"
            )

            sender = self.app.config.get("MAIL_DEFAULT_SENDER") or "noreply@cybersense.ai"
            return send_notification_email(self.mail, sender, user.email, subject, body)

    def notify_email_notifications_enabled(self, user) -> bool:
        """
        Sends confirmation email when email_notifications is toggled from False -> True.
        """
        if not user or not user.email or not self.mail or not self.app:
            return False

        with self.app.app_context():
            subject = "CyberSense AI - Email Notifications Enabled"
            body = (
                f"Hello {user.name},\n\n"
                f"Email notifications have been enabled for your CyberSense AI account.\n\n"
                f"You will now receive eligible security and account notifications according to your preferences.\n\n"
                f"CyberSense AI Team"
            )

            sender = self.app.config.get("MAIL_DEFAULT_SENDER") or "noreply@cybersense.ai"
            return send_notification_email(self.mail, sender, user.email, subject, body)

    def notify_marketing_opt_in(self, user) -> bool:
        """
        Sends confirmation email when marketing_emails is toggled from False -> True.
        """
        if not user or not user.email or not self.mail or not self.app:
            return False

        with self.app.app_context():
            subject = "CyberSense AI - Marketing Communications Preference Updated"
            body = (
                f"Hello {user.name},\n\n"
                f"You have successfully opted into CyberSense AI promotional updates and newsletter communications.\n\n"
                f"You can manage or opt out of marketing emails anytime from your Profile Settings.\n\n"
                f"CyberSense AI Team"
            )

            sender = self.app.config.get("MAIL_DEFAULT_SENDER") or "noreply@cybersense.ai"
            return send_notification_email(self.mail, sender, user.email, subject, body)


notification_service = NotificationService()
