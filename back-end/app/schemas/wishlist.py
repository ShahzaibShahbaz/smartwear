from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class WishlistItem(BaseModel):
    product_id: str = Field(..., description="Unique identifier of the product")
    added_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when item was added")

class Wishlist(BaseModel):
    username: str = Field(..., description="Username of the user")
    items: List[WishlistItem] = Field(default_factory=list, description="List of wishlist items")