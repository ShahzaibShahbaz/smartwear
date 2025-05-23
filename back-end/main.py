from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, cart, images, products, admin
from app.database import connect_to_mongo  # Ensure this exists
from app.routes import order
from app.routes import wishlist
from app.routes import order, wishlist, contact, forgotpassword, chatbot, imagesearch, virtual_tryon



app = FastAPI(title="SmartWear API", version="1.0.0")

# Configure CORS dynamically
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add environment-based URLs
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

# Include routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(cart.router, prefix="/cart", tags=["cart"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(images.router, prefix="/images", tags=["images"])
app.include_router(order.router)
app.include_router(wishlist.router, prefix="/api", tags=["Wishlist"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
app.include_router(contact.router, tags=["contact"])
app.include_router(forgotpassword.router, prefix="/pwd",tags=["forgotpassword"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
app.include_router(imagesearch.router, prefix="/image-search", tags=["image-search"])
app.include_router(virtual_tryon.router, prefix="/virtual-tryon", tags=["virtual-tryon"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "smartwear-api"}


