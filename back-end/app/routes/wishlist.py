from fastapi import APIRouter, HTTPException, Depends
from app.schemas.wishlist import WishlistItem, Wishlist
from app.database import get_database
from app.services.auth import get_current_user
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId


class AddToWishlistRequest(BaseModel):
    product_id: str

router = APIRouter()

# Dependency to get wishlist collection
async def get_wishlist_collection(db=Depends(get_database)):
    return db["wishlist"]

async def get_products_collection (db = Depends(get_database)):
    return db["products"]

# Add product to wishlist
@router.post("/")
async def add_to_wishlist(
    request: AddToWishlistRequest,
    current_user: dict = Depends(get_current_user),
    wishlist_collection=Depends(get_wishlist_collection),
):
    
    try:
        username = current_user["username"]
        product_id = request.product_id
       
        # Find existing wishlist
        wishlist = await wishlist_collection.find_one({"username": username})

        if wishlist:
            # Check if product already exists
            if any(item["product_id"] == product_id for item in wishlist.get("items", [])):
                raise HTTPException(status_code=400, detail="Product already in wishlist")
            
            # Update existing wishlist
            await wishlist_collection.update_one(
                {"username": username},
                {"$push": {"items": {"product_id": product_id, "added_at": datetime.utcnow()}}}
            )
        else:
            # Create new wishlist
            new_wishlist = Wishlist(
                username=username,
                items=[WishlistItem(product_id=product_id)]
            )
            await wishlist_collection.insert_one(new_wishlist.model_dump())

        return {"message": "Product added to wishlist"}
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error adding to wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def get_wishlist(
    current_user: dict = Depends(get_current_user),
    wishlist_collection=Depends(get_wishlist_collection),
    products_collection=Depends(get_products_collection)
):
    try:
        username = current_user["username"]
        
        # Find the wishlist for the current user
        wishlist = await wishlist_collection.find_one({"username": username})
        
        # If no wishlist exists, return an empty list
        if not wishlist:
            return {"items": []}
        
        # Extract product_ids from the wishlist and convert to ObjectId
        product_ids = [ObjectId(item["product_id"]) for item in wishlist.get("items", [])]
        
        # Fetch product details for all product_ids in one query
        product_details = await products_collection.find(
            {"_id": {"$in": product_ids}},
            {"name": 1}
        ).to_list(length=None)
        
        # Create a dictionary of product details for quick lookup
        product_map = {str(product["_id"]): product.get("name", "Unknown") for product in product_details}
        
        # Return the items with product names
        return {
            "items": [
                {
                    "product_id": item["product_id"], 
                    "name": product_map.get(str(item["product_id"]), "Unknown"),
                    "added_at": item.get("added_at", datetime.utcnow())
                } for item in wishlist.get("items", [])
            ]
        }
    
    except Exception as e:
        print(f"Error retrieving wishlist: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve wishlist")


# Remove product from wishlist
@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    wishlist_collection=Depends(get_wishlist_collection)
):
    try:
        username = current_user["username"]
        
        # Remove the specific product from the wishlist
        result = await wishlist_collection.update_one(
            {"username": username},
            {"$pull": {"items": {"product_id": product_id}}}
        )
        
        # Check if the product was actually removed
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Product not found in wishlist")
        
        return {"message": "Product removed from wishlist"}
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error removing from wishlist: {e}")
        raise HTTPException(status_code=500, detail="Could not remove product from wishlist")