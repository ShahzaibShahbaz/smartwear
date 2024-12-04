from fastapi import APIRouter, Depends, HTTPException
from app.schemas.cart import CartRequest
from app.database import get_database
from app.services.auth import get_current_user  # Import your get_current_user dependency

router = APIRouter()

@router.post("/")
async def save_cart(cart: CartRequest, current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    try:
        username = current_user["username"]
        cart_data = cart.dict()
        cart_data["username"] = username
        
        print(f"Saving cart for username: {username} - Data: {cart_data}")  # Debugging log
        result = await db["carts"].insert_one(cart_data)
        return {"message": "Cart saved successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        print(f"Error saving cart: {e}")  # Debugging log
        raise HTTPException(status_code=500, detail="Failed to save cart")

@router.get("/")
async def get_cart(current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    try:
        username = current_user["username"]
        print(f"Fetching cart for username: {username}")  # Debugging log
        
        cart = await db["carts"].find_one({"username": username})
        
        if not cart:
            return {"username": username, "items": []}
        
        cart["_id"] = str(cart["_id"])
        return cart
    except Exception as e:
        print(f"Error fetching cart for username {username}: {e}")  # Debugging log
        raise HTTPException(status_code=500, detail="Failed to fetch cart")

# New DELETE endpoint to remove item from cart
@router.delete("/{product_id}")
async def delete_item_from_cart(product_id: str, current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    try:
        username = current_user["username"]
        print(f"Deleting product {product_id} from cart for username: {username}")
        
        # Update the cart by removing the specific item
        result = await db["carts"].update_one(
            {"username": username},
            {"$pull": {"items": {"product_id": product_id}}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        
        return {"message": f"Item {product_id} removed from cart"}
    
    except Exception as e:
        print(f"Error deleting item from cart: {e}")  # Debugging log
        raise HTTPException(status_code=500, detail="Failed to delete item from cart")
