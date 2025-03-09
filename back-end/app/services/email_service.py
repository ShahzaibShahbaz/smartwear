import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:
    def __init__(self):
        self.email = "smartwearauth@gmail.com"
        self.password = "gjls uwuq lwgb xnvq"
        self.smtp_server = "smtp.gmail.com"
        self.port = 587

    async def send_registration_email(self, to_email: str, username: str) -> bool:
        message = MIMEMultipart()
        message["From"] = self.email
        message["To"] = to_email
        message["Subject"] = "Welcome to SmartWear - Your Smart Shopping Experience!"

        body = f"""
        Dear {username},

        Thank you for joining SmartWear, your go-to destination for innovative and stylish smartwear.

        We're thrilled to have you as part of our community! Get ready to explore the latest in smart fashion and enjoy a seamless shopping experience tailored just for you.

        Stay tuned for exclusive offers, updates, and much more.

        Happy shopping!

        Best regards,  
        The SmartWear Team
        """

        message.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP(self.smtp_server, self.port) as server:
                server.starttls()
                server.login(self.email, self.password)
                server.send_message(message)
            return True
        except Exception as e:
            logging.error(f"Failed to send email: {str(e)}")
            return False

email_service = EmailService()