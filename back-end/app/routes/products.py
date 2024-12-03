# app/routes/products.py
from fastapi import APIRouter, Depends
from app.database import get_database

router = APIRouter()

from bson import ObjectId  # For ObjectId handling

@router.get("/products")
async def get_products(db=Depends(get_database)):
    """Fetch products from the database."""
    products = []
    async for product in db["products"].find():
        product["_id"] = str(product["_id"])  # Convert ObjectId to string
        products.append(product)
    return {"products": products}