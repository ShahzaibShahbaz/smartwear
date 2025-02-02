from fastapi import APIRouter, Depends, Query, HTTPException
from app.database import get_database
from bson import ObjectId
from typing import Optional
from math import ceil

router = APIRouter()

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