from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import AuthService
from app.database import get_database
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/signup")
async def signup(user: UserCreate, request: Request):
    try:
        print(f"Received signup request for user: {user.email}")  # Debug print
        db = await get_database(request)
        auth_service = AuthService(db)
        result = await auth_service.create_user(user.model_dump())
        print(f"User created successfully: {result}")  # Debug print
        return JSONResponse(
            status_code=201,
            content={
                "id": result["id"],
                "username": result["username"],
                "email": result["email"],
                "message": "User created successfully"
            }
        )
    except Exception as e:
        print(f"Error in signup: {str(e)}")  # Debug print
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signin")
async def signin(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None
):
    try:
        db = await get_database(request)
        auth_service = AuthService(db)
        
        # Authenticate user
        user = await auth_service.authenticate_user(form_data.username, form_data.password)
        
        # Find user details
        user_details = await db.users.find_one({"email": form_data.username})
        
        return {
            "access_token": user["access_token"],
            "token_type": "bearer",
            "user": {
                "id": str(user_details["_id"]),
                "username": user_details["username"],
                "email": user_details["email"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))