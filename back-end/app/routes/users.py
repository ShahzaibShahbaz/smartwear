from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import AuthService
from app.database import get_database
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from bson import ObjectId
from pydantic import BaseModel


class StatusUpdate(BaseModel):
    status: str

# Define the password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
                "message": "User created successfully",
                "is_admin": False # Added for admin logic
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
    

SECRET_KEY = "secret_key"

@router.post("/admin/login")
async def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    request: Request = None
):
    db = await get_database(request)
    users_collection = db["users"]  # Access users collection

    user = await users_collection.find_one({"email": form_data.username})
    if not user or not pwd_context.verify(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not an admin user.")

    token_data = {"sub": user["email"], "role": "admin"}
    token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

@router.get("/")
async def fetch_users(db=Depends(get_database)):
    """Fetch all users."""
    collection = db["users"]
    users = await collection.find().to_list(100)
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string
    return {"users": users}


@router.delete("/{user_id}")
async def delete_user(user_id: str, db=Depends(get_database)):
    """Delete a user."""
    collection = db["users"]
    result = await collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


@router.patch("/{user_id}/status")
async def update_user_status(user_id: str, status_update: StatusUpdate, db=Depends(get_database)):
    if status_update.status not in ["active", "suspended"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    collection = db["users"]
    result = await collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": status_update.status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User status updated to {status_update.status}"}
