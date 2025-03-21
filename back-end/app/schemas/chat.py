from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []

class Product(BaseModel):
    name: str
    product_type: str
    color: str
    price: float
    image_url: Optional[str] = None
    product_id: Optional[str] = None
    gender: Optional[str] = None
    size: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    products: List[Product] = Field(default_factory=list)