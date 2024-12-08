# schema/order.py
from pydantic import BaseModel
from typing import List, Optional

class Item(BaseModel):
    product_id: str
    quantity: int
    price: float
    size: Optional[str] = None

class OrderRequest(BaseModel):
    user_id: str
    total_amount: float
    items: List[Item]

class OrderResponse(BaseModel):
    order_id: str
    user_id: str
    total_amount: float
    items: List[Item]
