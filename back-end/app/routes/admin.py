from fastapi import APIRouter, Depends
from app.services.auth import verify_admin_token  # Import token verification logic

router = APIRouter()

@router.get("/admin/dashboard")
async def admin_dashboard(authorized: bool = Depends(verify_admin_token)):
    return {"message": "Welcome to the Admin Dashboard"}
