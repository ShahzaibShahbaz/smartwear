from fastapi import APIRouter, HTTPException, Depends
from app.schemas.order import Item, OrderRequest, OrderResponse, FormData
from app.database import get_database
from app.services.auth import get_current_user
from pymongo.errors import PyMongoError
from bson import ObjectId
from pydantic import BaseModel
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
# Initialize FastAPI router
router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OrderData(BaseModel):
    orderId: str
    items: list
    total: float
    formData: dict

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
            formData=order.formData,
            status="pending"
        )
    except Exception as e:
        # Catch and log any errors
        print(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")
    

@router.get("/orders", response_model=List[OrderResponse])
async def get_orders_for_user(
    user_id: str,  # Filter by user ID
    db = Depends(get_database)
):
    try:
        # Find all orders for the given user
        orders = await db["orders"].find({"user_id": user_id}).to_list(length=100)
        
        # Prepare the response
        return [
            OrderResponse(
                order_id=str(order["_id"]),
                user_id=order["user_id"],
                total=order["total_amount"],
                items=[Item(**item) for item in order["items"]],
                formData=FormData(**order["formData"]),
                status=order.get("status", "pending") 
            )
            for order in orders
        ]
    except Exception as e:
        print(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db=Depends(get_database)):
    try:
        # Ensure the order_id is a valid ObjectId
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID format")

        # Query the database for the order
        order = await db["orders"].find_one({"_id": ObjectId(order_id)})
        
        if order is None:
            raise HTTPException(status_code=404, detail="Order not found")

        # Convert the order data to a response model
        return OrderResponse(
            order_id=str(order["_id"]),
            user_id=order.get("user_id", ""),
            total=order.get("total_amount", 0.0),
            items=[Item(**item) for item in order.get("items", [])],  # Validate item structure
            formData=FormData(**order.get("formData", {})),  # Validate formData structure
            status=order.get("status", "pending")  # Default to "pending" if missing
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching order: {str(e)}")
    
def send_email(order_data: OrderData):
    try:
        # SMTP server configuration
        smtp_server = "smtp.gmail.com"  # Replace with your SMTP server
        smtp_port = 587  # Or the port your server uses
        smtp_user = "smartwearauth@gmail.com"  # Replace with your email
        smtp_password = "gjls uwuq lwgb xnvq"  # Replace with your email password

      

        # Create the MIME message
        message = MIMEMultipart()
        message["From"] = smtp_user
        message["To"] = order_data.formData["email"]
        message["Subject"] = f"Order Confirmation - {order_data.orderId}"

        # Create email body (HTML format for better layout)
        body = f"""
        <h2>Order Confirmation</h2>
        <p>Your order {order_data.orderId} has been confirmed!</p>
        <h3>Order Details:</h3>
        <ul>
        """
        for item in order_data.items:
            body += f"<li>{item['name']} (x{item['quantity']}) - PKR {item['price'] * item['quantity']}</li>"
        body += f"""
        </ul>
        <p><strong>Total:</strong> PKR {order_data.total}</p>
        <h3>Shipping Address:</h3>
        <p>{order_data.formData['address']}, {order_data.formData['city']}, {order_data.formData['zip']}</p>
        <p><strong>Payment Method:</strong> {order_data.formData['paymentMethod']}</p>
        """

        # Attach the email body to the message
        message.attach(MIMEText(body, "html"))

        # Connect to the SMTP server and send the email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Encrypt the connection
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, order_data.formData["email"], message.as_string())
            logger.info(f"Email sent to {order_data.formData['email']}")

    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")
    
@router.post("/api/send-order-email")
async def send_order_email(order_data: OrderData):
    send_email(order_data)
    return {"message": "Email sent successfully"}