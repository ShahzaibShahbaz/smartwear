import asyncio
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

# MongoDB Connection Details
MONGO_DB_URL = "mongodb+srv://admin:shahzaib@smartwear-cluster.ksawq.mongodb.net/?retryWrites=true&w=majority&appName=smartwear-cluster"

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    """Create an admin user in MongoDB Atlas."""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_DB_URL, tlsCAFile=certifi.where())
        db = client["smartwear"]  # Replace with your actual database name
        users_collection = db["users"]

        # Admin Credentials
        admin_email = "admin1@gmail.com"
        admin_username = "admin"
        admin_password = "admin123"

        # Check if admin user already exists
        existing_admin = await users_collection.find_one({"email": admin_email})
        if existing_admin:
            print("Admin user already exists. No action taken.")
            return

        # Hash password and create admin user
        hashed_password = pwd_context.hash(admin_password)
        admin_user = {
            "username": admin_username,
            "email": admin_email,
            "password": hashed_password,
            "is_admin": True
        }

        await users_collection.insert_one(admin_user)
        print("Admin user created successfully!")

    except Exception as e:
        print(f"Failed to create admin user: {str(e)}")
    finally:
        # Correct: Close the MongoDB connection (No await here)
        client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
