import cloudinary
import cloudinary.uploader
from pymongo import MongoClient
import json
import os

# Configure Cloudinary
cloudinary.config(
    cloud_name="dlkzoykwu",
    api_key="571433884986814",
    api_secret="E4AL3XWMlzpX7Q6tgF9FusL3HBg",
    secure=True
)

# Connect to MongoDB
client = MongoClient(
    "mongodb+srv://admin:shahzaib@smartwear-cluster.ksawq.mongodb.net/"
    "?retryWrites=true&w=majority&appName=smartwear-cluster"
)
db = client["smartwear"]  # Database name
collection = db["products"]  # Collection name

# Function to upload image to Cloudinary
def upload_to_cloudinary(image_path):
    """
    Uploads an image to Cloudinary and returns the image URL.
    :param image_path: Path to the local image file.
    :return: URL of the uploaded image.
    """
    response = cloudinary.uploader.upload(image_path)
    return response.get("url")

# Function to save product data to MongoDB
def save_product_to_mongo(product):
    """
    Saves product data to MongoDB.
    :param product: Dictionary containing product data.
    :return: ID of the inserted MongoDB document.
    """
    result = collection.insert_one(product)
    return result.inserted_id

# Function to process products
def process_products(json_data):
    """
    Processes each product in the JSON data: uploads the image if needed
    and saves all data to MongoDB.
    :param json_data: List of product dictionaries.
    """
    for product in json_data:
        try:
            # Upload image to Cloudinary if image_url is missing
            if not product.get("image_url"):
                print(f"Uploading image for product: {product['name']}")
                product["image_url"] = upload_to_cloudinary(product["local_image_path"])
            
            # Remove local image path before saving to MongoDB
            product.pop("local_image_path", None)
            
            # Save the product to MongoDB
            document_id = save_product_to_mongo(product)
            print(f"Product saved with ID: {document_id}")
        except Exception as e:
            print(f"Failed to process product: {product['name']}, Error: {e}")

# Function to load JSON data from a file
def load_json_from_file(file_path):
    """
    Loads JSON data from a file.
    :param file_path: Path to the JSON file.
    :return: List of product dictionaries.
    """
    with open(file_path, "r") as file:
        return json.load(file)

# Execute the process
if __name__ == "__main__":
    try:
        # Define the path to the JSON file (from another folder)
        json_file_path = os.path.join("output", "products.json")  # Update this path
        products_json = load_json_from_file(json_file_path)
        
        # Process the product data
        process_products(products_json)
    except Exception as e:
        print(f"An error occurred: {e}")
