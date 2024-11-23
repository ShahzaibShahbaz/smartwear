# app/routes/users.py
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import create_user, login_for_access_token
from app.database import get_db
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate):
    return await create_user(user)

@router.post("/signin")
async def signin(form_data: OAuth2PasswordRequestForm = Depends()):
    return await login_for_access_token(form_data.username, form_data.password)
