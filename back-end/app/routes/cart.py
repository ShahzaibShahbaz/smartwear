from fastapi import APIRouter, Depends, HTTPException, Request
from app.schemas.cart import CartRequest
from app.database import get_database

router = APIRouter()

@router.post("/")
async def save_cart(cart: CartRequest, db=Depends(get_database)):  # Use CartRequest
    try:
        cart_data = cart.dict()
        print("Cart data being inserted:", cart_data)  # Debugging log
        result = await db["carts"].insert_one(cart_data)
        print("Insert result ID:", result.inserted_id)  # Debugging log
        return {"message": "Cart saved successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        print("Error saving cart:", str(e))  # Log any errors
        raise HTTPException(status_code=500, detail="Failed to save cart")


@router.get("/{user_id}")
async def get_cart(user_id: str, db=Depends(get_database)):
    try:
        cart = await db["carts"].find_one({"user_id": user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        cart["_id"] = str(cart["_id"])
        return cart
    except Exception as e:
        print("Error fetching cart:", str(e))  # Log any errors
        raise HTTPException(status_code=500, detail="Failed to fetch cart")