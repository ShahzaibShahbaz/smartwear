from fastapi import APIRouter, Depends, Query
from app.database import get_database
from bson import ObjectId
router = APIRouter()

@router.get("/")
async def get_products(gender: str = Query(None), db=Depends(get_database)):
    print(f"Received gender filter: {gender}")  # Add debug print
    products = []
    query = {"gender": gender} if gender else {}  # Add gender filter if provided

    async for product in db["products"].find(query):
        product["_id"] = str(product["_id"])  # Convert ObjectId to string
        products.append(product)
    return {"products": products}

