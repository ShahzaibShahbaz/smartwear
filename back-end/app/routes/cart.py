from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.schemas.cart import CartRequest
from app.database import get_database
from app.services.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class SyncItem(BaseModel):
    product_id: str
    quantity: int
    name: str
    price: float
    size: str = None
    image_url: str = None

class SyncCartRequest(BaseModel):
    items: List[SyncItem]


@router.post("/")
async def save_cart(cart: CartRequest, current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    try:
        username = current_user["username"]
        cart_data = cart.dict()
        cart_data["username"] = username
        product_id = cart_data["items"][0]["product_id"]
        quantity = cart_data["items"][0]["quantity"]

        existing_cart = await db["carts"].find_one({"username": username})

        if existing_cart:
            result = await db["carts"].update_one(
                {"username": username},
                {"$push": {"items": {"product_id": product_id, "quantity": quantity}}}
            )
            message = "Item added to existing cart."
        else:
            result = await db["carts"].insert_one(cart_data)
            message = "Cart created and item added."

        return {"message": message, "id": str(result.inserted_id) if not existing_cart else None}
    except Exception as e:
        print(f"Error saving cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to save cart")

@router.get("/")
async def get_cart(current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    try:
        username = current_user["username"]
        print(f"Fetching cart for username: {username}")
        
        cart = await db["carts"].find_one({"username": username})
        
        if not cart:
            return {"username": username, "items": []}
        
        cart["_id"] = str(cart["_id"])
        return cart
    except Exception as e:
        print(f"Error fetching cart for username {username}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cart")

@router.delete("/{product_id}")
async def delete_item_from_cart(product_id: str, current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    try:
        username = current_user["username"]
        print(f"Deleting product {product_id} from cart for username: {username}")
        
        result = await db["carts"].update_one(
            {"username": username},
            {"$pull": {"items": {"product_id": product_id}}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail=f"Item {product_id} not found in cart")

        return {"message": f"Item {product_id} removed from cart"}
    except Exception as e:
        print(f"Error deleting item from cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete item from cart")

@router.post("/sync")
async def sync_cart(
    cart_data: SyncCartRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    try:
        username = current_user["username"]
        
        # Convert items to a format suitable for MongoDB
        items = [item.dict(exclude_unset=True) for item in cart_data.items]
        
        # Update the entire cart with the new state
        result = await db["carts"].update_one(
            {"username": username},
            {"$set": {"items": items}},
            upsert=True
        )
        
        return {
            "message": "Cart synced successfully",
            "modified_count": result.modified_count if result.matched_count > 0 else 0
        }
    except Exception as e:
        print(f"Error syncing cart: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/update-quantity")
async def update_cart_quantity(
    product_id: str,
    quantity: int,
    size: str = None,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    try:
        username = current_user["username"]
        
        result = await db["carts"].update_one(
            {
                "username": username,
                "items.product_id": product_id
            },
            {"$set": {"items.$.quantity": quantity}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Item not found in cart")
            
        return {"message": "Quantity updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))