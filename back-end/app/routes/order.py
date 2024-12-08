from fastapi import APIRouter, HTTPException, Depends
from app.schemas.order import Item, OrderRequest, OrderResponse
from app.database import get_database  # Import the get_database function
from app.services.auth import get_current_user  # Import your get_current_user dependency
from pymongo.errors import PyMongoError

# Initialize FastAPI router
router = APIRouter()

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order: OrderRequest, 
    db = Depends(get_database)  # Inject the database dependency here
):
    try:
        # Convert the items list to a list of dictionaries
        items_dict = [item.dict() for item in order.items]
        
        # Prepare the order data
        order_data = {
            "user_id": order.user_id,
            "total_amount": order.total_amount,
            "items": items_dict,  # Use the dictionary representation of items
            "status": "pending",  # Set the initial status (can be modified later)
        }

        # Insert the order into the "orders" collection
        result = await db["orders"].insert_one(order_data)
        order_id = str(result.inserted_id)  # Convert ObjectId to string for response

        # Return the order response with order details
        return OrderResponse(order_id=order_id, **order_data)

    except Exception as e:
        # Catch any errors
        print(f"Error creating order: {e}")  # Debugging log
        raise HTTPException(status_code=500, detail="Failed to create order")