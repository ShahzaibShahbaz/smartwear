from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.database import get_database
from datetime import datetime, timedelta
import random
import string
import bcrypt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter()

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "smartwearauth@gmail.com"
SMTP_PASSWORD = "gjls uwuq lwgb xnvq"

# Request models
class RequestPasswordReset(BaseModel):
    email: EmailStr

class VerifyResetCode(BaseModel):
    email: EmailStr
    reset_code: str

class ResetPassword(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str

async def send_email(to_email: str, subject: str, body: str):
    """Helper function to send emails"""
    try:
        message = MIMEMultipart()
        message["From"] = SMTP_USER
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def generate_reset_code():
    """Generate a 6-digit reset code"""
    return ''.join(random.choices(string.digits, k=6))

@router.post("/request-reset")
async def request_reset(request: RequestPasswordReset, db=Depends(get_database)):
    """Request a password reset"""
    try:
        # Check if user exists
        user = await db.users.find_one({"email": request.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate reset code
        reset_code = generate_reset_code()
        expiry = datetime.utcnow() + timedelta(minutes=15)

        # Save reset code to database
        await db.reset_codes.update_one(
            {"email": request.email},
            {
                "$set": {
                    "code": reset_code,
                    "expires_at": expiry,
                    "attempts": 0
                }
            },
            upsert=True
        )

        # Send email
        email_body = f"""
        Hello,

        You have requested to reset your password for your SMART wear account.

        Your password reset code is: {reset_code}

        This code will expire in 15 minutes.

        If you didn't request this reset, please ignore this email.

        Best regards,
        SMART wear Team
        """

        email_sent = await send_email(
            to_email=request.email,
            subject="Password Reset Code - SMART wear",
            body=email_body
        )

        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send reset code")

        return {"message": "Reset code has been sent to your email"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-reset-code")
async def verify_code(request: VerifyResetCode, db=Depends(get_database)):
    """Verify reset code"""
    try:
        # Find reset code record
        reset_record = await db.reset_codes.find_one({
            "email": request.email,
            "expires_at": {"$gt": datetime.utcnow()}
        })

        if not reset_record:
            raise HTTPException(status_code=400, detail="Reset code has expired")

        # Check attempts
        if reset_record.get("attempts", 0) >= 3:
            await db.reset_codes.delete_one({"email": request.email})
            raise HTTPException(status_code=400, detail="Too many incorrect attempts. Please request a new code.")

        # Verify code
        if reset_record["code"] != request.reset_code:  # Use reset_code instead of code
            await db.reset_codes.update_one(
                {"email": request.email},
                {"$inc": {"attempts": 1}}
            )
            raise HTTPException(status_code=400, detail="Invalid reset code")

        return {"message": "Code verified successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset-password")
async def reset_password(request: ResetPassword, db=Depends(get_database)):
    """Reset password using verified code"""
    try:
        # Verify code again
        reset_record = await db.reset_codes.find_one({
            "email": request.email,
            "code": request.reset_code,
            "expires_at": {"$gt": datetime.utcnow()}
        })

        if not reset_record:
            raise HTTPException(status_code=400, detail="Invalid or expired reset code")

        # Hash new password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(request.new_password.encode('utf-8'), salt)

        # Update password in database
        result = await db.users.update_one(
            {"email": request.email},
            {"$set": {"hashed_password": hashed_password.decode('utf-8')}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update password")

        # Delete used reset code
        await db.reset_codes.delete_one({"email": request.email})

        # Send confirmation email
        email_body = """
        Hello,

        Your password has been successfully reset.

        If you did not make this change, please contact our support team immediately.

        Best regards,
        SMART wear Team
        """

        await send_email(
            to_email=request.email,
            subject="Password Reset Successful - SMART wear",
            body=email_body
        )

        return {"message": "Password reset successful"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))