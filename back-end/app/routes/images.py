# app/routes/images.py
from fastapi import APIRouter, Depends
from app.database import get_database

router = APIRouter()

@router.get("/get-images")
async def get_images(db=Depends(get_database)):
    """Fetch image URLs from the database."""
    images = []
    async for image in db["products"].find({}, {"_id": 0}):
        images.append(image)
    return {"images": images}