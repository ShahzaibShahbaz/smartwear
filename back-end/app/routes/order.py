from fastapi import APIRouter, HTTPException, Depends, Body
from app.schemas.order import Item, OrderRequest, OrderResponse
from app.database import get_database  # Import the get_database function
from app.services.auth import get_current_user  # Import your get_current_user dependency
from pymongo.errors import PyMongoError
from bson import ObjectId
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
    

@router.get("/getorders")
async def get_orders(db=Depends(get_database)):
    collection: Collection = db["orders"]  # Use the 'orders' collection
    orders = await collection.find({}).to_list(100)  # Fetch up to 100 orders
    for order in orders:
        order["_id"] = str(order["_id"])  # Convert ObjectId to string for JSON compatibility
    return orders

@router.patch("/orders/{order_id}")
async def update_order_status(
    order_id: str, 
    status: str = Body(..., embed=True),  # Explicitly extract "status" from request body
    db=Depends(get_database)
):
    """
    Update the status of an order in the 'orders' collection.
    """
    collection: Collection = db["orders"]

    # Validate the status input
    valid_statuses = ["pending", "confirmed", "shipped", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    try:
        # Convert the order_id to ObjectId
        object_id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    # Update the status of the order
    result = await collection.update_one(
        {"_id": object_id}, {"$set": {"status": status}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": f"Order status updated to '{status}' successfully"}