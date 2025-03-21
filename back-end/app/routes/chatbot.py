from app.database import connect_to_mongo
from fastapi import APIRouter, HTTPException, Depends
import google.generativeai as genai  # type: ignore
from pydantic import BaseModel
import logging
import json
import re

system_instruction = "Act as a fashion stylist, keep your tone friendly and excited. Keep your answers short and concise. Dont use markdown. if the user mentions less details ask for product type, occasion, color or gender. if the user skips any information, still provide answers."

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logging.getLogger("pymongo").setLevel(logging.INFO)

GEMINI_API_KEY = "AIzaSyBKfcRSHhHbWqKAWdX27-SjDcidBqkY0yI"

genai.configure(api_key=GEMINI_API_KEY)

async def get_db():
    try:
        client = await connect_to_mongo()
        db = client["smartwear"]
        yield db
        logger.info("MongoDB connection successful")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")

class ChatRequest(BaseModel):
    message: str

router = APIRouter()

def extract_product_attributes(message):
    """Extract product attributes from the user's message using Gemini."""
    logger.debug(f"Checking if message is product-related: {message}")
    
    # First, use Gemini to determine if the query is product-related
    product_check_prompt = f"""
    Determine if this customer query is related to clothing, fashion, or product shopping: "{message}"
    
    Answer with ONLY "yes" if it's related to clothing, fashion, apparel, accessories or shopping for wearable products.
    Answer with ONLY "no" if it's not related to these topics.
    """
    
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        product_check_response = model.generate_content(product_check_prompt)
        is_product_related = product_check_response.text.strip().lower() == "yes"
        logger.debug(f"Gemini determined query is product related: {is_product_related}")
    except Exception as e:
        logger.error(f"Error checking if product related: {e}", exc_info=True)
        is_product_related = False
    
    logger.debug(f"Extracting attributes from message: {message}")

    extraction_prompt = f"""
    Extract product attributes from this customer query: "{message}"
    Focus on these attributes:
    1. Subcategory (e.g., Kurta, Kurta Set, Waistcoat, Unstitched, Trousers, Shalwar Kameez, Sherwani, Prince Coat, Co Ord Sets, Maxi, Kurti, Lehenga, Sharara, Gharara, Pishwas, Angrakha, Short Frock, Frock, etc.)
    2. Product type (e.g., Festive/Party Wear, Daily/Basic Wear, Bride/Groom Wear,Wedding/Guest Wear - Formal, Formal, Sleep Wear etc.)
    3. Color
    4. Occasion (e.g., casual, formal, birthday, wedding, night)
    5. Gender (it must be identified, only 4 responses are allowed: 'Men', 'Women', and 2 for kids: 'Boy' and 'Girl' case sensitive)
    6. Size (if mentioned)
    
    Return ONLY a JSON object with these attributes as keys. Leave attribute empty if not mentioned.
    Example output: {{"subcategory": "kurta", "product_type": "festive", "color": "blue", "occasion": "casual", "gender": "Men", "size": ""}}
    """

    try:
        response = model.generate_content(extraction_prompt)
        logger.debug(f"Raw Gemini response: {response.text}")

        text = response.text.strip()

        # Try to find a valid JSON object in the response
        try:
            # Clean the text to handle possible markdown formatting
            cleaned_text = re.sub(r"```json|```", "", text).strip()
            attributes = json.loads(cleaned_text)
            logger.debug(f"Successfully parsed JSON: {attributes}")
            
            attributes["query_is_product_related"] = is_product_related
            return attributes
            
        except json.JSONDecodeError:
            match = re.search(r"(\{.*\})", text, re.DOTALL)
            if match:
                extracted_json = match.group(1)
                try:
                    attributes = json.loads(extracted_json)
                    logger.debug(f"Extracted JSON with regex: {attributes}")
                    
                    attributes["query_is_product_related"] = is_product_related
                    return attributes
                    
                except json.JSONDecodeError:
                    logger.error(
                        f"Invalid JSON after regex extraction: {extracted_json}"
                    )

            # If all parsing fails, return a default empty dict with expected keys
            logger.error("Failed to extract JSON, returning default structure")
            return {
                "subcategory": "",
                "product_type": "",
                "color": "",
                "occasion": "",
                "gender": "",
                "size": "",
                "query_is_product_related": is_product_related
            }

    except Exception as e:
        logger.error(f"Error in extract_product_attributes: {e}", exc_info=True)
        return {
            "subcategory": "",
            "product_type": "",
            "color": "",
            "occasion": "",
            "gender": "",
            "size": "",
            "query_is_product_related": is_product_related
        }


async def find_matching_products(attributes, db, limit=3):
    """Find products in MongoDB that match the extracted attributes."""
    products_collection = db["products"]

    if not attributes.get("query_is_product_related", False):
        logger.debug("Query is not product-related, returning empty list")
        return []

    try:
        logger.debug(f"Finding products with attributes: {attributes}")
        query = {}

        # Add subcategory to query if specified
        if attributes.get("subcategory") and attributes["subcategory"]:
            query["subcategory"] = {"$regex": attributes["subcategory"], "$options": "i"}

        # Map common terms to your database fields
        if attributes.get("product_type"):
            product_type = attributes["product_type"].lower()

            # Map common queries to your product types
            type_mapping = {
                "sleep wear": "Sleep Wear",
                "night suit": "Sleep Wear",
                "pajamas": "Sleep Wear",
                "party": "Festive/Party Wear",
                "festive": "Festive/Party Wear",
                "birthday": "Festive/Party Wear",
                "wedding": "Bride/Groom Wear",
                "casual": "Daily/Basic Wear",
                "formal": "Wedding/Guest Wear - Formal",
                "shirt": "Kurta",
                "t-shirt": "Kurti",
                "tshirt": "Kurti",
                "pants": "Trousers",
                "jeans": "Trousers",
                "dress": "Maxi",
                "lehenga": "Lehenga",
                "sherwani": "Sherwani",
                "prince coat": "Prince Coat",
                "shalwar kameez": "Shalwar Kameez",
                "frock": "Frock",
                "gharara": "Gharara",
                "sharara": "Sharara",
                "pishwas": "Pishwas",
                "angrakha": "Angrakha",
                "co ord set": "Co Ord Sets",
                "waistcoat": "Waistcoat",
                "unstitched": "Unstitched",
                "polo shirt": "Polo Shirt"
            }


            # Find the closest match
            for key, value in type_mapping.items():
                if key in product_type:
                    query["product_type"] = value
                    break

        # Add color to query if specified
        if attributes.get("color") and attributes["color"]:
            query["color"] = {"$regex": attributes["color"], "$options": "i"}

        # If occasion is specified but product type isn't, map occasion to product type
        if (
            not query.get("product_type")
            and attributes.get("occasion")
            and attributes["occasion"]
        ):
            occasion = attributes["occasion"].lower()
            if any(
                word in occasion
                for word in ["party", "birthday", "festive", "celebration"]
            ):
                query["product_type"] = "Festive/Party Wear"
            elif any(word in occasion for word in ["sleep", "night", "bed"]):
                query["product_type"] = "Sleep Wear"
            elif any(word in occasion for word in ["formal", "office", "business"]):
                query["product_type"] = "Formal Wear"
            elif any(word in occasion for word in ["casual", "everyday", "regular"]):
                query["product_type"] = "Casual Wear"

        # Ensure gender is always included in the query
        query["gender"] = attributes.get("gender", "")

        logger.debug(f"Final MongoDB query: {query}")

        # If query is empty (no attributes extracted), return empty list
        if not query:
            logger.debug("Empty query, returning empty array")
            return []

        # # Ensure at least two attributes are provided in the query ------------------------------------------------------------------------------------------
        # if len({k: v for k, v in query.items() if v}) < 2:
        #     logger.debug("Not enough attributes provided, returning empty list")
        #     return []

        # Find matching products - updated to use to_list for async cursor
        products = await products_collection.find(query, {"_id": 0}).to_list(
            length=limit
        )
        logger.debug(f"Found {len(products)} products with specific query")

        # # If no products found with the specific query, try a more general query
        # if not products and "product_type" in query:
        #     general_query = {k: v for k, v in query.items() if k != "product_type"}
        #     logger.debug(f"No products found, trying general query: {general_query}")
        #     # Updated to use to_list for async cursor
        #     products = await products_collection.find(
        #         general_query, {"_id": 0}
        #     ).to_list(length=limit)
        #     logger.debug(f"Found {len(products)} products with general query")

        # If still no products, return an empty list instead of default products
        if not products:
            logger.debug("No products found with any query, returning empty list")
            return []  # Return empty list instead of default products

        return products
    
    except Exception as e:
        logger.error(f"Error in find_matching_products: {e}", exc_info=True)
        return []


@router.post("/chat")
async def chat_with_gemini(request: ChatRequest, db=Depends(get_db)):
    try:
        logger.debug(f"Received chat request: {request.message}")

        # Extract product attributes from the user message
        attributes = extract_product_attributes(request.message)

        # Find matching products - now correctly using await with the async function
        products = await find_matching_products(attributes, db)
        logger.debug(f"Found {len(products)} matching products")

        # Use the older style API without client
        model = genai.GenerativeModel("gemini-2.0-flash")

        # Create chat history
        chat_history = [
            {"role": "user", "parts": ["what can i wear for my birthday"]},
            {
                "role": "model",
                "parts": [
                    "Let's find the perfect birthday outfit! Tell me more – what kind of product type are you looking for? What color do you like? Is this for a guy or a girl?"
                ],
            },
            {"role": "user", "parts": ["i want a white dress for a girl"]},
            {
                "role": "model",
                "parts": [
                    "A white dress sounds fabulous! To make it extra special, how about a flowy maxi dress with delicate lace details for a bohemian vibe, or a chic bodycon mini dress with some sparkle?"
                ],
            },
            {"role": "user", "parts": ["recommend kurta for my son"]},
            {
                "role": "model",
                "parts": [
                    "Lets get your son looking dapper! For a festive occasion, you can try a kurta in a jewel tone like emerald or sapphire. Or, for something more casual, a cotton kurta in a pastel shade with simple embroidery would be perfect!"
                ],
            },
            {"role": "user", "parts": ["i want a yellow dress for my wife"]},
            {
                "role": "model",
                "parts": [
                    "A yellow dress for your wife sounds stunning! I think a flowy midi dress in a soft yellow shade would be so flattering! or a bright yellow sundress!"
                ],
            },
            {"role": "user", "parts": ["what can i wear for my brother's wedding"]},
            {
                "role": "model",
                "parts": [
                    "A wedding! How exciting! Tell me, are you male or female? What type of product you are looking for? Knowing this will help me pick out the perfect wedding outfit!"
                ],
            },
            {"role": "user", "parts": ["i m male and i want eastern outfit"]},
            {
                "role": "model",
                "parts": [
                    "For an eastern outfit at your brother's wedding, a sherwani would be amazing. Consider a sherwani in a rich color like navy blue or maroon with some embroidery. Alternatively, a kurta pajama with a prince coat is a stylish choice!"
                ],
            },
            {"role": "user", "parts": ["INSERT_INPUT_HERE"]},
        ]

        # Add product context to the user's message
        product_context = ""
        if products:
            product_context = "Based on the query, we have these available products: "
            for i, product in enumerate(products):
                product_context += f"{product.get('name', 'Product')} ({product.get('color', 'Various')}), "
        
        # Only include product context if products were found
        if products:
            augmented_message = f"{system_instruction}\n\n{request.message}\n\n[SYSTEM NOTE: {product_context}]"
        else:
            augmented_message = f"{system_instruction}\n\n{request.message}"

        try:
            # Create a chat session with history
            chat = model.start_chat(history=chat_history)

            # Send the user message and get response
            response = chat.send_message(
                augmented_message,
                generation_config={
                    "temperature": 1,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 4096,
                })

            # Return both the response and matching products
            return {"reply": response.text, "products": products}
        
        except Exception as e:
            logger.error(f"Error with Gemini API: {e}", exc_info=True)
            # Fallback response
            return {
                "reply": "I'm sorry, I'm having trouble processing your request right now. How else can I help you with fashion advice?",
                "products": products,
            }

    except Exception as e:
        logger.error(f"Error in chat_with_gemini: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

