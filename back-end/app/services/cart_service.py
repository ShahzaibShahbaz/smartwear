class CartService:
    def __init__(self, database):
        self.database = database

    async def get_cart_items(self, user_id: str):
        """Retrieve cart items for a specific user."""
        cart = await self.database.carts.find_one({"user_id": user_id})
        print(f"cart in service: {cart}")
        return cart.get('items', []) if cart else []

    async def update_cart_items(self, user_id: str, items: list):
        """Update or create cart for a user."""
        result = await self.database.carts.update_one(
            {"user_id": user_id},
            {"$set": {"items": items}},
            upsert=True
        )
        print(f"result in service: {result}")
        return items