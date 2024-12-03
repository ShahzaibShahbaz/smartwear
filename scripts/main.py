# Import necessary libraries
import cloudinary
import cloudinary.uploader
from pymongo import MongoClient

# Configure Cloudinary
cloudinary.config( 
    cloud_name="dlkzoykwu", 
    api_key="571433884986814", 
    api_secret="E4AL3XWMlzpX7Q6tgF9FusL3HBg",
    secure=True
)

# Function to upload image to Cloudinary
def upload_to_cloudinary(image_path):
    """
    Uploads an image to Cloudinary and returns the image URL.
    :param image_path: Path to the local image file.
    :return: URL of the uploaded image.
    """
    response = cloudinary.uploader.upload(image_path)
    return response.get("url")

# Connect to MongoDB
client = MongoClient(
    "mongodb+srv://admin:shahzaib@smartwear-cluster.ksawq.mongodb.net/"
    "?retryWrites=true&w=majority&appName=smartwear-cluster"
)
db = client["smartwear"]  # Database name
collection = db["images"]  # Collection name

# Function to save image URL to MongoDB
def save_image_url_to_mongo(image_url, category, subcategory):
    """
    Saves the image URL along with category and subcategory metadata to MongoDB.
    :param image_url: URL of the uploaded image.
    :param category: Product category (e.g., men, women, kids).
    :param subcategory: Product subcategory (e.g., shirts, t-shirts).
    :return: ID of the inserted MongoDB document.
    """
    data = {
        "image_url": image_url,
        "category": category,
        "subcategory": subcategory
    }
    result = collection.insert_one(data)
    return result.inserted_id

# Function to handle the entire upload and save process
def upload_and_save_image(image_path, category, subcategory):
    """
    Combines image upload to Cloudinary and saving its URL in MongoDB.
    :param image_path: Path to the local image file.
    :param category: Product category.
    :param subcategory: Product subcategory.
    :return: Confirmation message with MongoDB document ID.
    """
    # Step 1: Upload image to Cloudinary
    image_url = upload_to_cloudinary(image_path)
    
    # Step 2: Save image URL to MongoDB
    document_id = save_image_url_to_mongo(image_url, category, subcategory)
    
    return f"Image uploaded and saved with ID: {document_id}"

# Example usage
if __name__ == "__main__":
    # Path to the image file
    image_path = "kids.jpg"  # Replace with the actual path to your image
    
    # Metadata
    category = "kids"
    subcategory = "shirts"
    
    # Execute the process
    try:
        result = upload_and_save_image(image_path, category, subcategory)
        print(result)
    except Exception as e:
        print(f"An error occurred: {e}")
