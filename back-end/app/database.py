from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Request

MONGO_DB_URL = "mongodb+srv://admin:shahzaib@smartwear-cluster.ksawq.mongodb.net/?retryWrites=true&w=majority&appName=smartwear-cluster"

async def connect_to_mongo():
    """Establish connection to MongoDB Atlas."""
    try:
        client = AsyncIOMotorClient(MONGO_DB_URL)
        await client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas")
        return client
    except Exception as e:
        print(f"Failed to connect to MongoDB Atlas: {str(e)}")
        raise

async def get_database(request: Request):
    """Dependency to get database instance."""
    return request.app.mongodb