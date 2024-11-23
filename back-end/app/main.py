# app/main.py
from fastapi import FastAPI
from app.routes import users
from app.database import connect_to_mongo, get_db

app = FastAPI()

# Connect to MongoDB on startup
@app.on_event("startup")
async def startup_db():
    """Start MongoDB connection."""
    app.state.db_client = await connect_to_mongo()  # Store the client in app.state

# Close MongoDB connection on shutdown
@app.on_event("shutdown")
async def shutdown_db():
    """Close MongoDB connection."""
    if hasattr(app.state, 'db_client'):
        app.state.db_client.close()

# Include user routes
app.include_router(users.router, prefix="/users", tags=["users"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "OK"}
