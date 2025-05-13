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
import cv2
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

class ImageSearchService:
    def __init__(self, database):
        """Initialize the service with a database connection."""
        self.database = database
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
        # Store product embeddings and color histograms
        self.product_embeddings = None
        self.product_color_histograms = []
        self.product_ids = []
        self.is_initialized = False
        print(f"ImageSearchService initialized with device: {self.device}")

    def _extract_color_histogram(self, image: Image.Image) -> np.ndarray:
        """Extract color histogram from an image."""
        # Convert PIL Image to OpenCV format
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to HSV color space
        hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
        
        # Calculate histogram
        hist = cv2.calcHist([hsv], [0, 1], None, [180, 256], [0, 180, 0, 256])
        
        # Normalize histogram
        cv2.normalize(hist, hist, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        
        return hist.flatten()

    def _extract_dominant_color(self, image: Image.Image, n_colors: int = 3, crop_ratio: float = 0.5) -> np.ndarray:
        """Extract the dominant color from the center region of the image using k-means clustering in HSV."""
        width, height = image.size
        crop_w, crop_h = int(width * crop_ratio), int(height * crop_ratio)
        left = (width - crop_w) // 2
        upper = (height - crop_h) // 2
        right = left + crop_w
        lower = upper + crop_h
        center_region = image.crop((left, upper, right, lower))
        hsv_img = center_region.convert('HSV')
        arr = np.array(hsv_img)
        pixels = arr.reshape(-1, 3)
        # Remove low saturation/value pixels (likely background)
        pixels = pixels[(pixels[:,1] > 10) & (pixels[:,2] > 10)]
        if len(pixels) == 0:
            # fallback: use mean color
            return arr.reshape(-1, 3).mean(axis=0)
        kmeans = KMeans(n_clusters=n_colors, n_init=5, random_state=42)
        kmeans.fit(pixels)
        counts = np.bincount(kmeans.labels_)
        dominant = kmeans.cluster_centers_[np.argmax(counts)]
        return dominant

    async def initialize(self):
        """Load and precompute product embeddings and color histograms from product images."""
        if self.is_initialized:
            return
            
        print("Starting embeddings initialization...")
        products = await self.database.products.find({}).to_list(None)
        
        # Prepare product IDs, embeddings tensors, and color histograms
        all_embeddings = []
        all_color_histograms = []
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
                            # Get image embedding
                            image_embedding = self.model.encode_image(image_input).squeeze(0)
                            # Normalize embedding
                            normalized_embedding = image_embedding / image_embedding.norm()
                            all_embeddings.append(normalized_embedding.cpu())
                            
                            # Extract and store color histogram
                            color_hist = self._extract_color_histogram(image)
                            all_color_histograms.append(color_hist)
                            
                            valid_product_ids.append(product_id)
                            print(f"Processed embedding and color histogram for product: {product_id}")
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
            self.product_color_histograms = np.array(all_color_histograms)
        else:
            self.product_embeddings = torch.zeros((0, 512))
            self.product_color_histograms = np.array([])
        
        self.is_initialized = True
        print(f"Initialized embeddings and color histograms for {len(self.product_ids)} products")

    async def _fetch_image(self, image_url: str) -> Image.Image:
        """Fetch an image from URL and return PIL Image object."""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            return Image.open(io.BytesIO(response.content)).convert('RGB')
        except (RequestException, IOError) as e:
            print(f"Error fetching image from {image_url}: {e}")
            return None

    async def find_similar_products(self, file: UploadFile, top_k: int = 5, top_n_clip: int = 20, hue_threshold: float = 20.0) -> List[Dict[Any, Any]]:
        print("[DEBUG] find_similar_products called")
        if not self.is_initialized:
            await self.initialize()
        if len(self.product_ids) == 0:
            print("[DEBUG] No product_ids available")
            return []
        try:
            # Process the uploaded image
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            # Preprocess and encode the query image
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                query_embedding = self.model.encode_image(image_input)
                query_embedding /= query_embedding.norm(dim=-1, keepdim=True)
            # CLIP similarity with all product embeddings
            if self.product_embeddings.device != query_embedding.device:
                query_embedding = query_embedding.to(self.product_embeddings.device)
            clip_similarities = (query_embedding @ self.product_embeddings.T).squeeze(0)
            # Get top N by CLIP similarity
            n = min(top_n_clip, len(clip_similarities))
            top_clip_similarities, top_indices = torch.topk(clip_similarities, n)
            print(f"[DEBUG] Number of top_indices: {len(top_indices)}")
            print("[DEBUG] About to extract dominant color for query image")
            try:
                query_dom_color = self._extract_dominant_color(image)
                query_hue = float(query_dom_color[0])
                print(f"[DEBUG] Query dominant hue: {query_hue}")
            except Exception as e:
                print(f"[DEBUG] Exception during dominant color extraction: {e}")
                raise
            # Filter by hue similarity
            color_matched = []
            for i, idx in enumerate(top_indices):
                product_id = self.product_ids[idx]
                product = await self.database.products.find_one({"_id": ObjectId(product_id)})
                if product and "image_url" in product and product["image_url"]:
                    prod_image = await self._fetch_image(product["image_url"])
                    if prod_image:
                        try:
                            prod_dom_color = self._extract_dominant_color(prod_image)
                            prod_hue = float(prod_dom_color[0])
                            hue_dist = abs(query_hue - prod_hue)
                            print(f"[DEBUG] Product {product_id} hue: {prod_hue}, hue_dist: {hue_dist}")
                            if hue_dist < hue_threshold:
                                product["_id"] = str(product["_id"])
                                product["similarity_score"] = float(top_clip_similarities[i])
                                color_matched.append((product, float(top_clip_similarities[i])))
                        except Exception as e:
                            print(f"[DEBUG] Exception during product dominant color extraction: {e}")
            if not color_matched:
                print("[DEBUG] No products passed the hue filter")
            # Sort by CLIP similarity and return top_k
            color_matched.sort(key=lambda x: x[1], reverse=True)
            return [p for p, _ in color_matched[:top_k]]
        except Exception as e:
            print(f"[DEBUG] Exception occurred: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")