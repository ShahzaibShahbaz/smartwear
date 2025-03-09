from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@router.post("/contact")
async def contact_us(form_data: ContactForm):
    try:
        # Email configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_user = "smartwearauth@gmail.com"
        smtp_password = "gjls uwuq lwgb xnvq"

        # Create message
        message = MIMEMultipart()
        message["From"] = smtp_user
        message["To"] = smtp_user  # Send to your support email
        message["Subject"] = f"New Contact Form Submission: {form_data.subject}"

        # Create email body
        body = f"""
        New contact form submission from {form_data.name}

        From: {form_data.email}
        Subject: {form_data.subject}

        Message:
        {form_data.message}
        """

        message.attach(MIMEText(body, "plain"))

        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)

        # Send confirmation email to user
        user_message = MIMEMultipart()
        user_message["From"] = smtp_user
        user_message["To"] = form_data.email
        user_message["Subject"] = "We've received your message - SMART wear"

        user_body = f"""
        Dear {form_data.name},

        Thank you for contacting SMART wear. We've received your message and will get back to you within 24 hours.

        Your message details:
        Subject: {form_data.subject}

        We appreciate your interest in SMART wear.

        Best regards,
        The SMART wear Team
        """

        user_message.attach(MIMEText(user_body, "plain"))
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(user_message)

        return {"message": "Message sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))