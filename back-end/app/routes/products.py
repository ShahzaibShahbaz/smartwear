from fastapi import APIRouter, Depends, Query, HTTPException
from app.database import get_database
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal
from bson import ObjectId
from datetime import datetime
from typing import Optional
from math import ceil

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
async def get_products(
    gender: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db=Depends(get_database)
):
    print(f"Received gender filter: {gender}, page: {page}, limit: {limit}")
    
    # Calculate skip for pagination
    skip = (page - 1) * limit
    
    # Base query to filter by approved status
    query = {"status": "approved"}
    
    # Add gender filter if provided
    if gender == "kids":
        query["gender"] = {"$in": ["Girl", "Boy"]}
    elif gender:
        query["gender"] = gender
    
    try:
        # Get total count for pagination
        total_products = await db["products"].count_documents(query)
        total_pages = ceil(total_products / limit)
        
        # Get paginated products
        cursor = db["products"].find(query).skip(skip).limit(limit)
        products = []
        
        async for product in cursor:
            product["_id"] = str(product["_id"])
            products.append(product)
        
        return {
            "products": products,
            "pagination": {
                "total": total_products,
                "pages": total_pages,
                "current_page": page,
                "limit": limit,
                "has_next": page < total_pages,
                "has_previous": page > 1
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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
    products = await collection.find().to_list(500)
    for product in products:
        product["_id"] = str(product["_id"])  # Convert ObjectId to string
    return {"products": products}
@router.get("/{product_id}")
async def get_product(product_id: str, db=Depends(get_database)):
    try:
        product = await db["products"].find_one({"_id": ObjectId(product_id)})
        if product:
            product["_id"] = str(product["_id"])
            return product
        raise HTTPException(status_code=404, detail="Product not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
