from fastapi import APIRouter, HTTPException, Depends
from app.schemas.order import Item, OrderRequest, OrderResponse, FormData
from app.database import get_database
from app.services.auth import get_current_user
from pymongo.errors import PyMongoError
from bson import ObjectId

# Initialize FastAPI router
router = APIRouter()

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order: OrderRequest, 
    db = Depends(get_database)
):
    try:
        # Convert the items list to a list of dictionaries
        items_dict = [item.dict() for item in order.items]
        
        # Prepare the order data
        order_data = {
            "user_id": order.user_id,
            "total_amount": order.total,  # Use total from frontend
            "items": items_dict,
            "status": "pending",
            "formData": order.formData.dict()  # Include form data
        }
        
        # Insert the order into the "orders" collection
        result = await db["orders"].insert_one(order_data)
        order_id = str(result.inserted_id)  # Convert ObjectId to string for response
        
        # Return the order response with order details
        return OrderResponse(
            order_id=order_id, 
            user_id=order.user_id, 
            total=order.total, 
            items=order.items,
            formData=order.formData
        )
    except Exception as e:
        # Catch and log any errors
        print(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")