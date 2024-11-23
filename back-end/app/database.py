
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from fastapi import FastAPI, Depends
from typing import Generator

# MongoDB Atlas connection URI and database name
MONGO_DB_URL = "mongodb+srv://admin:shahzaib@smartwear-cluster.ksawq.mongodb.net/?retryWrites=true&w=majority&appName=smartwear-cluster"
DATABASE_NAME = "smartwear"

async def connect_to_mongo():
    """Establish connection to MongoDB Atlas."""
    client = AsyncIOMotorClient(MONGO_DB_URL)
    try:
        # Check if the connection is successful
        await client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas")
    except ConnectionFailure:
        print("Failed to connect to MongoDB Atlas")
        raise Exception("MongoDB connection error")
    return client

async def get_db(app: FastAPI = Depends()) -> Generator:
    """Dependency that returns the database instance."""
    if not hasattr(app.state, 'db_client'):
        raise Exception("Database connection not established")
    db = app.state.db_client[DATABASE_NAME]
    return db

# main.py updates
async def startup_db_event(app: FastAPI):
    """Start MongoDB connection."""
    app.state.db_client = await connect_to_mongo()

async def shutdown_db_event(app: FastAPI):
    """Close MongoDB connection."""
    if hasattr(app.state, 'db_client'):
        app.state.db_client.close()