from pydantic import BaseModel

class WishlistItem(BaseModel):
    user_id: str
    product_id: str
