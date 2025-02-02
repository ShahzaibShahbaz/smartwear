from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status, Depends
from jose import jwt, JWTError
import bcrypt
from bson import ObjectId
from app.database import get_database
from app.services.email_service import email_service  
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/signin")

SECRET_KEY = "your-secret-key-keep-it-secret"
REFRESH_SECRET_KEY = "your-refresh-secret-key"  # Add this to env variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
REFRESH_TOKEN_EXPIRE_DAYS = 30

class AuthService:
    def __init__(self, database):
        self.database = database


    def create_refresh_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        password = plain_password.encode('utf-8')
        stored_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password, stored_password)

    def get_password_hash(self, password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    async def create_tokens(self, email: str) -> dict:
        access_token = self.create_access_token(
            data={"sub": email},
            expires_delta=timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        )
        refresh_token = self.create_refresh_token({"sub": email})
        
        # Store refresh token in database
        await self.database.refresh_tokens.update_one(
            {"email": email},
            {"$set": {
                "token": refresh_token,
                "expires_at": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
            }},
            upsert=True
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    async def create_user(self, user_data: dict) -> dict:
        user_data["hashed_password"] = self.get_password_hash(user_data.pop("password"))
        user_data.pop("confirm_password", None)
        
        existing_user = await self.database.users.find_one({
            "$or": [
                {"email": user_data["email"]},
                {"username": user_data["username"]}
            ]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
            )

        result = await self.database.users.insert_one(user_data)
        created_user = await self.database.users.find_one({"_id": result.inserted_id})
        created_user["id"] = str(created_user.pop("_id"))
        
        try:
            await email_service.send_registration_email(
                to_email=created_user["email"],
                username=created_user["username"]
            )
        except Exception as e:
            print(f"Error sending welcome email: {str(e)}")
        
        return created_user

    async def authenticate_user(self, email: str, password: str) -> dict:
        user = await self.database.users.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not self.verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create token with new expiration time
        access_token = self.create_access_token(
            data={"sub": email},
            expires_delta=timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    def decode_token(self, token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=401, 
                detail="Could not validate credentials"
            )

async def get_current_user(token: str = Depends(oauth2_scheme), database=Depends(get_database)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token: missing 'sub'")
        
        user = await database.users.find_one({"email": email})
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return {
            "username": user["username"], 
            "email": user["email"]
        }
    except JWTError as e:
        print(f"JWT decoding error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"Unexpected error in get_current_user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")