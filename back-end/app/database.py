from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Request
import certifi

MONGO_DB_URL = "mongodb+srv://admin:iU2eMAqxgccAaUWY@smartwear-cluster.ksawq.mongodb.net/?retryWrites=true&w=majority&appName=smartwear-cluster"

async def ensure_collections(client):
    """Ensure all required collections exist."""
    db = client["smartwear"]
    collections = await db.list_collection_names()
    
    required_collections = [
        "users",
        "products",
        "carts",
        "orders",
        "wishlist",
        "refresh_tokens"
    ]
    
    for collection in required_collections:
        if collection not in collections:
            await db.create_collection(collection)
            print(f"Created collection: {collection}")

async def connect_to_mongo():
    """Establish connection to MongoDB Atlas."""
    try:
        client = AsyncIOMotorClient(MONGO_DB_URL, tlsCAFile=certifi.where())
        await client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas")
        
        # Ensure all required collections exist
        await ensure_collections(client)
        
        return client
    except Exception as e:
        print(f"Failed to connect to MongoDB Atlas: {str(e)}")
        raise

async def get_database(request: Request):
    """Dependency to get database instance."""
    return request.app.mongodb