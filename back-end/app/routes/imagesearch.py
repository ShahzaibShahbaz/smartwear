# app/routes/imagesearch.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Dict, Any

from app.database import get_database
from app.services.imagesearch_service import ImageSearchService

router = APIRouter()

# Create image search service with dependency injection
image_search_service = None

@router.post("/search", response_model=List[Dict[Any, Any]])
async def search_similar_products(
    file: UploadFile = File(...),
    limit: int = 12,
    db = Depends(get_database)
):
    """Search for similar products based on uploaded image."""
    global image_search_service
    
    # Initialize service on first use
    if image_search_service is None:
        image_search_service = ImageSearchService(db)
        
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Initialize service if not already initialized
        if not image_search_service.is_initialized:
            await image_search_service.initialize()
            
        similar_products = await image_search_service.find_similar_products(file, top_k=limit)
        return similar_products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing search: {str(e)}")