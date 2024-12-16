# schema/order.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Item(BaseModel):
    product_id: str
    quantity: int
    price: float
    size: Optional[str] = None

class FormData(BaseModel):
    address: str
    city: str
    country: str
    email: EmailStr
    firstName: str
    lastName: str
    paymentMethod: str
    phone: str
    zip: str

class OrderRequest(BaseModel):
    user_id: str
    total: float  # Changed from total_amount to match your frontend
    items: List[Item]
    formData: FormData  # Added to include shipping/billing information

class OrderResponse(BaseModel):
    order_id: str
    user_id: str
    total: float
    items: List[Item]
    formData: FormData