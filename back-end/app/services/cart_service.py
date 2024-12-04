class CartService:
    def __init__(self, database):
        self.database = database

    async def get_cart_items(self, username: str):
        """Retrieve cart items for a specific user by username."""
        cart = await self.database.carts.find_one({"username": username})
        print(f"Cart retrieved for username {username}: {cart}")
        return cart.get('items', []) if cart else []

    async def update_cart_items(self, username: str, items: list):
        """Update or create cart for a user by username."""
        result = await self.database.carts.update_one(
            {"username": username},
            {"$set": {"items": items}},
            upsert=True
        )
        print(f"Cart updated for username {username}: {result}")
        return items
