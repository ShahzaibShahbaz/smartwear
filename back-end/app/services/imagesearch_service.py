# services/imagesearch_service.py
import torch
import clip
from PIL import Image
import numpy as np
import io
from typing import List, Dict, Any
from fastapi import UploadFile, HTTPException
from bson.objectid import ObjectId
import requests
from requests.exceptions import RequestException

class ImageSearchService:
    def __init__(self, database):
        """Initialize the service with a database connection."""
        self.database = database
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
        # Store product embeddings
        self.product_embeddings = None
        self.product_ids = []
        self.is_initialized = False
        print(f"ImageSearchService initialized with device: {self.device}")

    async def initialize(self):
        """Load and precompute product embeddings from product images."""
        if self.is_initialized:
            return
            
        print("Starting embeddings initialization...")
        products = await self.database.products.find({}).to_list(None)
        
        # Prepare product IDs and embeddings tensors
        all_embeddings = []
        valid_product_ids = []
        
        for product in products:
            product_id = str(product["_id"])
            
            if "image_url" in product and product["image_url"]:
                try:
                    # Download and process image
                    image = await self._fetch_image(product["image_url"])
                    if image:
                        # Preprocess and encode the image
                        image_input = self.preprocess(image).unsqueeze(0).to(self.device)
                        
                        with torch.no_grad():
                            # Get actual image embedding instead of random
                            image_embedding = self.model.encode_image(image_input).squeeze(0)
                            # Normalize embedding
                            normalized_embedding = image_embedding / image_embedding.norm()
                            all_embeddings.append(normalized_embedding.cpu())  # Move to CPU for storage
                            valid_product_ids.append(product_id)
                            print(f"Processed embedding for product: {product_id}")
                    else:
                        print(f"Could not fetch image for product: {product_id}")
                except Exception as e:
                    print(f"Error processing product {product_id}: {e}")
            else:
                print(f"No image URL for product: {product_id}")
        
        # Update product IDs with only valid ones
        self.product_ids = valid_product_ids
        
        # Stack all embeddings into a single tensor
        if all_embeddings:
            self.product_embeddings = torch.stack(all_embeddings)
        else:
            self.product_embeddings = torch.zeros((0, 512))  # Empty tensor with correct dimensions
        
        self.is_initialized = True
        print(f"Initialized embeddings for {len(self.product_ids)} products")

    async def _fetch_image(self, image_url: str) -> Image.Image:
        """Fetch an image from URL and return PIL Image object."""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            return Image.open(io.BytesIO(response.content)).convert('RGB')
        except (RequestException, IOError) as e:
            print(f"Error fetching image from {image_url}: {e}")
            return None

    async def find_similar_products(self, file: UploadFile, top_k: int = 12) -> List[Dict[Any, Any]]:
        """Find similar products based on image similarity using CLIP."""
        # Ensure embeddings are initialized
        if not self.is_initialized:
            await self.initialize()
        
        if len(self.product_ids) == 0:
            return []
            
        try:
            # Process the uploaded image
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            
            # Preprocess and encode the query image
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                # Get image embedding
                query_embedding = self.model.encode_image(image_input)
                # Normalize embedding
                query_embedding /= query_embedding.norm(dim=-1, keepdim=True)
            
            # Calculate similarity with all product embeddings
            # Move query embedding to CPU if product embeddings are on CPU
            if self.product_embeddings.device != query_embedding.device:
                query_embedding = query_embedding.to(self.product_embeddings.device)
                
            similarities = (query_embedding @ self.product_embeddings.T).squeeze(0)
            
            # Get top-k similar products
            k = min(top_k, len(similarities))
            if k > 0:
                top_similarities, top_indices = torch.topk(similarities, k)
                
                # Retrieve product details from database
                similar_products = []
                
                for i, idx in enumerate(top_indices):
                    product_id = self.product_ids[idx]
                    similarity_score = float(top_similarities[i])
                    
                    # Get product from database
                    product = await self.database.products.find_one({"_id": ObjectId(product_id)})
                    
                    if product:
                        # Convert ObjectId to string
                        product["_id"] = str(product["_id"])
                        # Add similarity score
                        product["similarity_score"] = similarity_score
                        similar_products.append(product)
                
                return similar_products
            
            return []
            
        except Exception as e:
            print(f"Error in find_similar_products: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")