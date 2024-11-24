from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users
from app.database import connect_to_mongo

app = FastAPI(title="SmartWear API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your front-end URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db():
    """Start MongoDB connection."""
    app.mongodb_client = await connect_to_mongo()
    app.mongodb = app.mongodb_client["smartwear"]

@app.on_event("shutdown")
async def shutdown_db():
    """Close MongoDB connection."""
    if hasattr(app, "mongodb_client"):
        app.mongodb_client.close()

app.include_router(users.router, prefix="/users", tags=["users"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "smartwear-api"}
