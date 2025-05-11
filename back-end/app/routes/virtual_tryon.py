import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
import io # For handling bytes as a file-like object
import uuid # For generating unique filenames
from bson import ObjectId
from app.database import get_database


router = APIRouter()

# Ensure these are strings
RAPIDAPI_KEY = "1926b03207mshb018457d7685caep138dbdjsn44ad4d7598dd"
RAPIDAPI_HOST = "try-on-diffusion.p.rapidapi.com"
EXTERNAL_API_URL = f"https://{RAPIDAPI_HOST}/try-on-url"

# Cloudinary settings for backend uploads
CLOUDINARY_CLOUD_NAME = "dlkzoykwu"
CLOUDINARY_UPLOAD_PRESET = "unsigned_preset"
CLOUDINARY_API_URL_BASE = "https://api.cloudinary.com/v1_1/"


# Pydantic models
class TryOnURLRequest(BaseModel):
    person_image_url: HttpUrl
    garment_image_url: HttpUrl

# New model for product-based try-on
class ProductTryOnRequest(BaseModel):
    person_image_url: HttpUrl
    product_id: str  # Product ID from MongoDB

class TryOnURLResponse(BaseModel):
    result_url: HttpUrl


async def upload_bytes_to_cloudinary(image_bytes: bytes, original_content_type: str) -> HttpUrl:
    if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_UPLOAD_PRESET:
        raise HTTPException(status_code=500, detail="Server Cloudinary upload settings are misconfigured.")

    cloudinary_url = f"{CLOUDINARY_API_URL_BASE}{CLOUDINARY_CLOUD_NAME}/image/upload"
    
    file_extension = original_content_type.split('/')[-1] 
    filename = f"tryon_result_{uuid.uuid4().hex}.{file_extension}"

    payload_data = {
        "upload_preset": CLOUDINARY_UPLOAD_PRESET,
    }
    files_data = {"file": (filename, image_bytes, original_content_type)}

    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            response = await client.post(cloudinary_url, data=payload_data, files=files_data)
            response.raise_for_status()
            cloudinary_data = response.json()
            if "secure_url" not in cloudinary_data:
                print(f"Cloudinary upload error: 'secure_url' not in response. Data: {cloudinary_data}")
                raise HTTPException(status_code=500, detail="Failed to get URL from image storage after upload.")
            return HttpUrl(cloudinary_data["secure_url"])
        except httpx.HTTPStatusError as exc:
            error_body = "Unknown error"
            try:
                error_body = exc.response.json()
            except Exception:
                error_body = exc.response.text
            print(f"Cloudinary upload HTTPStatusError: {exc.response.status_code} - {error_body}")
            raise HTTPException(status_code=502, detail=f"Image storage service error: {exc.response.status_code}")
        except Exception as e:
            print(f"Cloudinary upload general error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to store result image: {str(e)}")


@router.post("/try-on", response_model=TryOnURLResponse)
async def try_on_with_url(request_data: TryOnURLRequest):
    # Basic check for hardcoded values (though they are hardcoded now)
    if not RAPIDAPI_KEY or not RAPIDAPI_HOST or not isinstance(RAPIDAPI_HOST, str): # Added str check for safety
        raise HTTPException(status_code=500, detail="RapidAPI credentials are not configured correctly (must be strings).")
    if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_UPLOAD_PRESET:
         raise HTTPException(status_code=500, detail="Server image storage for results is not configured.")

    external_api_payload = {
        "avatar_image_url": str(request_data.person_image_url),
        "clothing_image_url": str(request_data.garment_image_url)
    }
    external_api_headers = {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # Ensure EXTERNAL_API_URL is correctly formatted before this call
            current_external_api_url = f"https://{RAPIDAPI_HOST}/try-on-url" # Recalculate to be sure if there was any doubt

            response_external_api = await client.post(
                current_external_api_url, # Use the correctly formed URL
                data=external_api_payload,
                headers=external_api_headers
            )
            response_external_api.raise_for_status() 

            response_content_type = response_external_api.headers.get("Content-Type", "").lower()
            final_result_url: HttpUrl

            if "application/json" in response_content_type:
                api_response_data = response_external_api.json()
                if "result_url" not in api_response_data:
                    print(f"External API (JSON) missing 'result_url'. Data: {api_response_data}")
                    raise HTTPException(status_code=502, detail="External API provided invalid JSON response.")
                final_result_url = HttpUrl(api_response_data["result_url"])
            elif "image/" in response_content_type: 
                image_bytes = await response_external_api.aread()
                final_result_url = await upload_bytes_to_cloudinary(image_bytes, response_content_type)
            else:
                error_text = await response_external_api.atext()
                print(f"External API unexpected Content-Type: {response_content_type}. Text: {error_text[:200]}")
                raise HTTPException(status_code=502, detail="External API returned an unexpected response format.")

            return TryOnURLResponse(result_url=final_result_url)

        except httpx.HTTPStatusError as exc:
            error_detail = f"Try-on service error (Status {exc.response.status_code})"
            try:
                error_content = exc.response.json()
                error_detail = f"Try-on service error: {error_content.get('message', exc.response.text[:200])}"
            except Exception:
                error_detail = f"Try-on service error (Status {exc.response.status_code}): {exc.response.text[:200]}"
            print(f"HTTPStatusError from external API: {error_detail}")
            raise HTTPException(status_code=exc.response.status_code if exc.response.status_code >=400 else 500, detail=error_detail) # Ensure valid client/server error status
        except httpx.RequestError as exc:
            print(f"RequestError connecting to external API: {exc}")
            raise HTTPException(status_code=503, detail=f"Could not connect to try-on service: {exc}")
        except HTTPException: 
            raise
        except Exception as e: 
            print(f"An unexpected error in /try-on endpoint: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {str(e)}")


# New endpoint that accepts a product ID instead of a direct garment URL
@router.post("/try-on-product", response_model=TryOnURLResponse)
async def try_on_with_product(
    request_data: ProductTryOnRequest,
    db=Depends(get_database)
):
    try:
        # Validate product ID format
        if not ObjectId.is_valid(request_data.product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID format")
        
        # Fetch product from database
        product = await db["products"].find_one({"_id": ObjectId(request_data.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get the image URL from the product
        if "image_url" not in product or not product["image_url"]:
            raise HTTPException(status_code=400, detail="Product does not have an image URL")
        
        # Create a new request with the product's image URL
        tryon_request = TryOnURLRequest(
            person_image_url=request_data.person_image_url,
            garment_image_url=product["image_url"]
        )
        
        # Call the existing try-on endpoint
        return await try_on_with_url(tryon_request)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error in try_on_with_product: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {str(e)}")