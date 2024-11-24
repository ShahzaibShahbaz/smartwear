from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from jose import jwt
import bcrypt
from bson import ObjectId

SECRET_KEY = "your-secret-key-keep-it-secret"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
    def __init__(self, database):
        self.database = database

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        # Convert strings to bytes
        password = plain_password.encode('utf-8')
        stored_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password, stored_password)

    def get_password_hash(self, password: str) -> str:
        # Generate salt and hash password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')  # Convert bytes back to string for storage

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

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
        
        access_token = self.create_access_token(data={"sub": email})
        return {"access_token": access_token, "token_type": "bearer"}