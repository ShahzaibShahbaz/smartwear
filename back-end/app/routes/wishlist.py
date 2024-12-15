from fastapi import APIRouter, HTTPException, Depends
from app.database import get_database
from bson.objectid import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()


class WishlistItem(BaseModel):
    user_id: str
    product_id: str


# Dependency to get the wishlist collection
async def get_wishlist_collection(db=Depends(get_database)): 
    return db["wishlist"]

# Add a product to the wishlist
@router.post("/wishlist/add")
async def add_to_wishlist(
    item: WishlistItem,
    wishlist_collection=Depends(get_wishlist_collection)
):
    wishlist = await wishlist_collection.find_one({"user_id": item.user_id})

    if wishlist:
        # Check if the product is already in the wishlist
        if any(entry["product_id"] == item.product_id for entry in wishlist["items"]):
            raise HTTPException(status_code=400, detail="Product already in wishlist")
        
        # Add the product to the wishlist
        await wishlist_collection.update_one(
            {"user_id": item.user_id},
            {"$push": {"items": {"product_id": item.product_id, "added_at": datetime.utcnow()}}}
        )
    else:
        # Create a new wishlist document
        await wishlist_collection.insert_one({
            "user_id": item.user_id,
            "items": [{"product_id": item.product_id, "added_at": datetime.utcnow()}]
        })

    return {"message": "Product added to wishlist"}

# Get all wishlist items for a user
@router.get("/wishlist")
async def get_wishlist(user_id: str, wishlist_collection=Depends(get_wishlist_collection)):
    try:
        print(f"Fetching wishlist for user_id: {user_id}")  # Debug log
        wishlist = await wishlist_collection.find_one({"user_id": user_id})
        if not wishlist:
            print("No wishlist found for the user.")  # Debug log
            return {"items": []}
        print(f"Wishlist retrieved: {wishlist['items']}")  # Debug log
        return {"items": wishlist["items"]}
    except Exception as e:
        print(f"Error retrieving wishlist: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch wishlist")


# Remove a product from the wishlist
@router.delete("/wishlist/remove")
async def remove_from_wishlist(
    user_id: str,
    product_id: str,
    wishlist_collection=Depends(get_wishlist_collection)
):
    wishlist = await wishlist_collection.find_one({"user_id": user_id})
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    # Remove the product from the wishlist
    await wishlist_collection.update_one(
        {"user_id": user_id},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "Product removed from wishlist"}
