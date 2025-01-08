from fastapi import APIRouter, Depends, Query
from app.database import get_database
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal
from bson import ObjectId
from datetime import datetime
router = APIRouter()

class Product(BaseModel):
    name: str
    price: float
    image_url: str
    size: List[str]
    description: str
    gender: str
    subcategory: str
    color: str
    product_type: str
    status: Literal["pending", "approved", "disapproved"] = "pending"

@router.get("/")
async def get_products(gender: str = Query(None), db=Depends(get_database)):
    print(f"Received gender filter: {gender}")  # Add debug print
    products = []
    query = {"gender": gender} if gender else {}  # Add gender filter if provided

    async for product in db["products"].find(query):
        product["_id"] = str(product["_id"])  # Convert ObjectId to string
        products.append(product)
    return {"products": products}


@router.post("/add")
async def add_product(product: Product, db=Depends(get_database)):
    collection = db["products"]
    product_dict = product.dict()
    product_dict["_id"] = ObjectId()
    product_dict["created_at"] = datetime.utcnow()

    result = await collection.insert_one(product_dict)
    if result.inserted_id:
        return {"message": "Product added successfully", "product_id": str(result.inserted_id)}
    raise HTTPException(status_code=500, detail="Failed to add product")

@router.patch("/{product_id}/approve")
async def approve_product(product_id: str, db=Depends(get_database)):
    collection = db["products"]
    result = await collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"status": "approved"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product approved successfully"}

@router.patch("/{product_id}/disapprove")
async def disapprove_product(product_id: str, db=Depends(get_database)):
    collection = db["products"]
    result = await collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"status": "disapproved"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product disapproved successfully"}

@router.get("/pending")
async def get_pending_products(db=Depends(get_database)):
    collection = db["products"]
    products = await collection.find({"status": "pending"}).to_list(100)
    for product in products:
        product["_id"] = str(product["_id"])
    return products

@router.get("/approved")
async def get_approved_products(db=Depends(get_database)):
    collection = db["products"]
    products = await collection.find({"status": "approved"}).to_list(100)
    for product in products:
        product["_id"] = str(product["_id"])
    return products

@router.get("/disapproved")
async def get_disapproved_products(db=Depends(get_database)):
    collection = db["products"]
    products = await collection.find({"status": "disapproved"}).to_list(100)
    for product in products:
        product["_id"] = str(product["_id"])
    return products

@router.get("/get")
async def get_all_products(db=Depends(get_database)):
    collection = db["products"]
    products = await collection.find().to_list(100)
    for product in products:
        product["_id"] = str(product["_id"])  # Convert ObjectId to string
    return {"products": products}