import bcrypt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Union
from app.database import get_db


from app.schemas.user import UserCreate, UserInDB, UserResponse
from fastapi import HTTPException, status
from pydantic import BaseModel
from bson import ObjectId

SECRET_KEY = "mysecretkey"  # Should be in environment variable or config
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_email(email: str) -> Union[UserInDB, None]:
    db = get_db()  # Call get_db() to get the database instance
    user = await db.users.find_one({"email": email})

    if user:
        return UserInDB(**user)

async def get_user_by_id(user_id: str) -> Union[UserInDB, None]:
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        return UserInDB(**user)

async def create_user(user: UserCreate) -> UserResponse:
    db = get_db()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]

    result = await db.users.insert_one(user_dict)
    new_user = await db.users.find_one({"_id": result.inserted_id})
    return UserResponse(id=str(new_user["_id"]), **new_user)

async def authenticate_user(email: str, password: str) -> UserInDB:
    user = await get_user_by_email(email)
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return user

async def login_for_access_token(email: str, password: str):
    user = await authenticate_user(email, password)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}
