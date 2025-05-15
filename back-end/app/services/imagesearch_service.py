# services/imagesearch_service.py
import torch
import clip
from PIL import Image
import numpy as np
import io
from typing import List, Dict, Any, Tuple
from fastapi import UploadFile, HTTPException
from bson.objectid import ObjectId
import requests
from requests.exceptions import RequestException
import cv2
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImageSearchService:
    def __init__(self, database):
        """Initialize the service with a database connection."""
        self.database = database
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # Load CLIP model for embeddings and zero-shot classification
        self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
        
        # Common fashion product categories and subcategories
        self.product_categories = [
            "shirt", "t-shirt", "blouse", "kurta", "dress", 
            "pants", "jeans", "skirt", "shorts", 
            "jacket", "coat", "sweater", "sweatshirt", "hoodie",
            "shoes", "sneakers", "boots", "sandals",
            "hat", "cap", "scarf", "accessories"
        ]
        
        # Category groups for similarity matching
        self.category_groups = {
            "tops": ["shirt", "t-shirt", "blouse", "kurta", "sweater", "sweatshirt", "hoodie"],
            "bottoms": ["pants", "jeans", "skirt", "shorts"],
            "outerwear": ["jacket", "coat"],
            "dresses": ["dress"],
            "footwear": ["shoes", "sneakers", "boots", "sandals"],
            "accessories": ["hat", "cap", "scarf", "accessories"]
        }
        
        # Store data for quick retrieval
        self.product_embeddings = None
        self.product_categories_map = {}  # Map product_id to its category
        self.product_dominant_colors = {}  # Map product_id to dominant colors
        self.product_ids = []
        self.is_initialized = False
        
        logger.info(f"ImageSearchService initialized with device: {self.device}")

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

    def _segment_foreground_improved(self, image: Image.Image) -> Image.Image:
        """Advanced foreground segmentation using multiple techniques."""
        # Convert PIL image to cv2 format
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        h, w = img.shape[:2]
        
        # Strategy 1: GrabCut with center focus
        try:
            # Create mask
            mask = np.zeros(img.shape[:2], np.uint8)
            
            # Set rectangle for foreground (center area of the image)
            margin = min(h, w) // 5  # 20% margin from each side
            rect = (margin, margin, w - 2*margin, h - 2*margin)
            
            # GrabCut algorithm parameters
            bgd_model = np.zeros((1, 65), np.float64)
            fgd_model = np.zeros((1, 65), np.float64)
            
            # Apply GrabCut
            cv2.grabCut(img, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
            mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            
            # Check if foreground is too small or too large
            fg_percentage = mask2.sum() / (h * w)
            if 0.1 <= fg_percentage <= 0.9:  # Reasonable foreground size
                img_fg = img * mask2[:, :, np.newaxis]
                
                # Create white background
                white_bg = np.ones_like(img) * 255
                img_result = white_bg * (1 - mask2[:, :, np.newaxis]) + img_fg
                
                logger.info(f"GrabCut segmentation successful, foreground: {fg_percentage:.2f}")
                # Convert back to PIL Image
                return Image.fromarray(cv2.cvtColor(img_result.astype(np.uint8), cv2.COLOR_BGR2RGB))
        except Exception as e:
            logger.warning(f"GrabCut segmentation failed: {e}")
        
        # Strategy 2: Saliency-based segmentation
        try:
            # Use saliency detection
            saliency = cv2.saliency.StaticSaliencySpectralResidual_create()
            success, saliencyMap = saliency.computeSaliency(img)
            
            if success:
                # Threshold the saliency map
                _, threshMap = cv2.threshold(
                    (saliencyMap * 255).astype('uint8'), 
                    0, 255, 
                    cv2.THRESH_BINARY | cv2.THRESH_OTSU
                )
                
                # Apply morphological operations to clean up the mask
                kernel = np.ones((5, 5), np.uint8)
                threshMap = cv2.morphologyEx(threshMap, cv2.MORPH_OPEN, kernel)
                threshMap = cv2.morphologyEx(threshMap, cv2.MORPH_CLOSE, kernel)
                
                # Apply mask
                fg_percentage = threshMap.sum() / (h * w * 255)
                if 0.1 <= fg_percentage <= 0.9:  # Reasonable foreground size
                    img_fg = cv2.bitwise_and(img, img, mask=threshMap)
                    
                    # Create white background
                    white_bg = np.ones_like(img) * 255
                    img_result = white_bg * (1 - threshMap[:, :, np.newaxis] / 255) + img_fg
                    
                    logger.info(f"Saliency segmentation successful, foreground: {fg_percentage:.2f}")
                    # Convert back to PIL Image
                    return Image.fromarray(cv2.cvtColor(img_result.astype(np.uint8), cv2.COLOR_BGR2RGB))
        except Exception as e:
            logger.warning(f"Saliency segmentation failed: {e}")
        
        # Strategy 3: Simple center crop as fallback
        try:
            center_margin = min(h, w) // 3  # 33% margin
            center_img = img[center_margin:h-center_margin, center_margin:w-center_margin]
            if center_img.size > 0:
                logger.info("Using center crop as fallback segmentation")
                return Image.fromarray(cv2.cvtColor(center_img, cv2.COLOR_BGR2RGB))
        except Exception as e:
            logger.warning(f"Center crop failed: {e}")
        
        # Return original image if all segmentation methods fail
        logger.warning("All segmentation methods failed, using original image")
        return image

    def _extract_dominant_colors(self, image: Image.Image, n_colors: int = 5) -> List[Tuple[np.ndarray, float]]:
        """Extract dominant colors from the image using k-means clustering with background removal."""
        # First try to segment the foreground
        try:
            segmented_image = self._segment_foreground_improved(image)
            logger.info("Using segmented image for color extraction")
        except Exception as e:
            logger.warning(f"Segmentation failed, using original image: {e}")
            segmented_image = image
        
        # Convert to HSV for better color analysis
        hsv_img = cv2.cvtColor(np.array(segmented_image), cv2.COLOR_RGB2HSV)
        
        # Reshape to list of pixels
        pixels = hsv_img.reshape(-1, 3)
        
        # Remove low saturation/value pixels (likely background/neutral)
        mask = (pixels[:,1] > 20) & (pixels[:,2] > 30)
        valid_pixels = pixels[mask]
        
        if len(valid_pixels) < 100:  # Not enough valid pixels
            logger.warning("Not enough valid pixels after filtering, using all pixels")
            valid_pixels = pixels
            
        # Ensure we don't request more clusters than pixels
        actual_n_colors = min(n_colors, len(valid_pixels))
        
        if actual_n_colors == 0:
            logger.warning("No valid pixels found, returning black as fallback")
            # Return black as fallback
            return [(np.array([0, 0, 0]), 1.0)]
            
        # Perform k-means clustering
        kmeans = KMeans(n_clusters=actual_n_colors, n_init=10, random_state=42)
        kmeans.fit(valid_pixels)
        
        # Get cluster centers and their proportions
        centers = kmeans.cluster_centers_
        labels = kmeans.labels_
        proportions = np.bincount(labels) / len(labels)
        
        # Convert HSV centers to RGB for storage and compatibility
        rgb_centers = []
        for hsv_color in centers:
            # Create a 1x1 HSV image with the color
            hsv_pixel = np.array([[hsv_color]], dtype=np.uint8)
            # Convert to RGB
            rgb_pixel = cv2.cvtColor(hsv_pixel, cv2.COLOR_HSV2RGB)
            rgb_centers.append(rgb_pixel[0, 0])
        
        rgb_centers = np.array(rgb_centers)
        
        # Sort by proportion
        idx = np.argsort(proportions)[::-1]
        rgb_centers = rgb_centers[idx]
        proportions = proportions[idx]
        
        # Pad results if we have fewer colors than requested
        if len(rgb_centers) < n_colors:
            rgb_centers = np.pad(rgb_centers, ((0, n_colors - len(rgb_centers)), (0, 0)), mode='edge')
            proportions = np.pad(proportions, (0, n_colors - len(proportions)), mode='edge')
        
        # Log the extracted colors
        for i, (color, prop) in enumerate(zip(rgb_centers, proportions)):
            logger.info(f"Color {i+1}: RGB={color.astype(int)}, Proportion={prop:.2f}")
        
        return [(rgb_centers[i], proportions[i]) for i in range(n_colors)]

    def _get_color_name(self, rgb_color: np.ndarray) -> str:
        """Map RGB color to a basic color name."""
        r, g, b = rgb_color
        
        # Convert to HSV for easier color naming
        hsv_color = cv2.cvtColor(np.array([[[r, g, b]]], dtype=np.uint8), cv2.COLOR_RGB2HSV)[0][0]
        h, s, v = hsv_color
        
        # Normalize values
        h = h / 180.0
        s = s / 255.0
        v = v / 255.0
        
        # Define color thresholds
        if v < 0.2:
            return "black"
        if s < 0.15 and v > 0.8:
            return "white"
        if s < 0.15:
            return "gray"
        
        # Define hue ranges for basic colors
        if h < 0.035 or h > 0.96:
            return "red"
        elif 0.035 <= h < 0.09:
            return "orange"
        elif 0.09 <= h < 0.19:
            return "yellow"
        elif 0.19 <= h < 0.45:
            return "green"
        elif 0.45 <= h < 0.53:
            return "teal"
        elif 0.53 <= h < 0.74:
            return "blue"
        elif 0.74 <= h < 0.82:
            return "purple"
        elif 0.82 <= h < 0.96:
            return "pink"
        else:
            return "unknown"

    def _calculate_color_similarity(self, query_colors: List[Tuple[np.ndarray, float]], 
                                   product_colors: List[Tuple[np.ndarray, float]]) -> float:
        """Calculate weighted color similarity between query and product colors."""
        # Extract only the colors with their weights
        q_colors = [color for color, _ in query_colors]
        q_weights = np.array([weight for _, weight in query_colors])
        p_colors = [color for color, _ in product_colors]
        p_weights = np.array([weight for _, weight in product_colors])
        
        total_sim = 0.0
        total_weight = 0.0
        
        # Color similarity matrix (query colors x product colors)
        sim_matrix = np.zeros((len(q_colors), len(p_colors)))
        
        for i, q_color in enumerate(q_colors):
            for j, p_color in enumerate(p_colors):
                # Calculate color distance
                color_dist = np.sqrt(np.sum((q_color.astype(float) - p_color.astype(float))**2)) / 441.67  # Max possible RGB distance
                color_sim = 1.0 - min(color_dist, 1.0)  # Similarity between 0-1
                sim_matrix[i, j] = color_sim
        
        # For each query color, find best match and weight by proportions
        for i, q_weight in enumerate(q_weights):
            # Skip colors with very low proportion
            if q_weight < 0.05:
                continue
                
            # Find best matching product color
            best_match_idx = np.argmax(sim_matrix[i])
            match_sim = sim_matrix[i, best_match_idx]
            p_weight = p_weights[best_match_idx]
            
            # Weight similarity by both proportions
            weighted_sim = match_sim * q_weight * p_weight
            total_sim += weighted_sim
            total_weight += q_weight
        
        if total_weight == 0:
            return 0.0
            
        # Normalize and return
        return total_sim / total_weight

    def _get_category_group(self, category: str) -> str:
        """Map a category to its category group."""
        for group, categories in self.category_groups.items():
            if category in categories:
                return group
        return "other"

    def _calculate_category_similarity(self, query_category: str, product_category: str) -> float:
        """Calculate similarity between product categories."""
        # Same exact category
        if query_category == product_category:
            return 1.0
            
        # Check if one is substring of the other (e.g., "shirt" and "t-shirt")
        if query_category in product_category or product_category in query_category:
            return 0.7
            
        # Check if they're in the same category group
        query_group = self._get_category_group(query_category)
        product_group = self._get_category_group(product_category)
        
        if query_group == product_group:
            return 0.5
            
        # Different category groups
        return 0.1

    async def _classify_product_category(self, image: Image.Image) -> Tuple[str, Dict[str, float]]:
        """Perform zero-shot classification to determine product category with confidence scores."""
        # Define more specific prompts for better classification
        prompts = [f"a {category}" for category in self.product_categories]
        prompts += [f"a photo of a {category}" for category in self.product_categories]
        
        # Prepare text tokens for categories
        text_inputs = torch.cat([clip.tokenize(prompt) for prompt in prompts]).to(self.device)
        
        # Process image
        image_input = self.preprocess(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            # Get image features
            image_features = self.model.encode_image(image_input)
            # Get text features
            text_features = self.model.encode_text(text_inputs)
            
            # Normalize features
            image_features /= image_features.norm(dim=-1, keepdim=True)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            
            # Calculate similarities and average between prompt variants
            raw_similarities = image_features @ text_features.T
            n_categories = len(self.product_categories)
            
            # Average the similarities from both prompt templates
            similarity_a = raw_similarities[0, :n_categories]
            similarity_b = raw_similarities[0, n_categories:]
            avg_similarity = (similarity_a + similarity_b) / 2
            
            # Apply softmax to get probabilities
            probs = (100.0 * avg_similarity).softmax(dim=-1)
            
            # Get top predictions and scores
            values, indices = probs.topk(3)
            
            # Create dictionary of category -> confidence
            confidence_scores = {}
            for i in range(len(self.product_categories)):
                confidence_scores[self.product_categories[i]] = float(probs[i].item())
            
            # Return top category and all confidence scores
            top_category = self.product_categories[indices[0].item()]
            confidence = values[0].item()
            
            logger.info(f"Classified product as: {top_category} with confidence {confidence:.2f}")
            logger.info(f"Alternative categories: {self.product_categories[indices[1].item()]} ({values[1].item():.2f}), "
                      f"{self.product_categories[indices[2].item()]} ({values[2].item():.2f})")
            
            return top_category, confidence_scores

    async def initialize(self):
        """Load and precompute product embeddings and metadata from product images."""
        if self.is_initialized:
            return
            
        logger.info("Starting embeddings initialization...")
        products = await self.database.products.find({}).to_list(None)
        
        # Prepare product data
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
                            # Get image embedding
                            image_embedding = self.model.encode_image(image_input).squeeze(0)
                            # Normalize embedding
                            normalized_embedding = image_embedding / image_embedding.norm()
                            all_embeddings.append(normalized_embedding.cpu())
                            
                            # Extract and store dominant colors
                            dominant_colors = self._extract_dominant_colors(image)
                            self.product_dominant_colors[product_id] = dominant_colors
                            
                            # Store product category (either from database or classify)
                            if "category" in product and product["category"]:
                                self.product_categories_map[product_id] = product["category"].lower()
                            else:
                                # Try to classify the product
                                category, _ = await self._classify_product_category(image)
                                self.product_categories_map[product_id] = category
                            
                            valid_product_ids.append(product_id)
                            logger.info(f"Processed product: {product_id}, category: {self.product_categories_map[product_id]}")
                    else:
                        logger.warning(f"Could not fetch image for product: {product_id}")
                except Exception as e:
                    logger.error(f"Error processing product {product_id}: {e}")
            else:
                logger.warning(f"No image URL for product: {product_id}")
        
        # Update product IDs with only valid ones
        self.product_ids = valid_product_ids
        
        # Stack all embeddings into a single tensor
        if all_embeddings:
            self.product_embeddings = torch.stack(all_embeddings)
        else:
            self.product_embeddings = torch.zeros((0, 512))
        
        self.is_initialized = True
        logger.info(f"Initialized data for {len(self.product_ids)} products")

    async def _fetch_image(self, image_url: str) -> Image.Image:
        """Fetch an image from URL and return PIL Image object."""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            return Image.open(io.BytesIO(response.content)).convert('RGB')
        except (RequestException, IOError) as e:
            logger.error(f"Error fetching image from {image_url}: {e}")
            return None

    async def find_similar_products(self, file: UploadFile, top_k: int = 10, 
                                     weights: Dict[str, float] = None) -> List[Dict[Any, Any]]:
        """Find similar products based on category, color, and visual similarity."""
        logger.info("find_similar_products called")
        
        # Default weights if not provided
        if weights is None:
            weights = {
                "category": 0.3,  # Category similarity weight
                "color": 0.4,     # Color similarity weight
                "visual": 0.3     # Visual/CLIP similarity weight
            }
        
        if not self.is_initialized:
            await self.initialize()
            
        if len(self.product_ids) == 0:
            logger.warning("No product_ids available")
            return []
            
        try:
            # Process the uploaded image
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            
            # 1. Classify the product category
            query_category, category_scores = await self._classify_product_category(image)
            logger.info(f"Detected query product category: {query_category}")
            
            # 2. Extract dominant colors from foreground-segmented image
            segmented_image = self._segment_foreground_improved(image)
            query_dominant_colors = self._extract_dominant_colors(segmented_image)
            color_names = [self._get_color_name(color) for color, _ in query_dominant_colors]
            logger.info(f"Detected query colors: {color_names}")
            
            # 3. Get CLIP embedding
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                query_embedding = self.model.encode_image(image_input)
                query_embedding /= query_embedding.norm(dim=-1, keepdim=True)
                
            # 4. Calculate similarities and rank products
            combined_scores = []
            
            for i, product_id in enumerate(self.product_ids):
                # Get product data
                product_category = self.product_categories_map.get(product_id, "")
                product_colors = self.product_dominant_colors.get(product_id, [])
                
                # Calculate CLIP/visual similarity
                if self.product_embeddings.device != query_embedding.device:
                    prod_embedding = self.product_embeddings[i].to(query_embedding.device)
                else:
                    prod_embedding = self.product_embeddings[i]
                    
                visual_similarity = float((query_embedding @ prod_embedding.unsqueeze(1)).squeeze())
                
                # Calculate color similarity
                color_similarity = self._calculate_color_similarity(query_dominant_colors, product_colors)
                
                # Calculate category similarity
                category_similarity = self._calculate_category_similarity(query_category, product_category)
                
                # Combined score (weighted sum)
                combined_score = (
                    weights["visual"] * visual_similarity + 
                    weights["color"] * color_similarity + 
                    weights["category"] * category_similarity
                )
                
                combined_scores.append((product_id, combined_score, {
                    "visual_similarity": round(visual_similarity, 3),
                    "color_similarity": round(color_similarity, 3),
                    "category_similarity": round(category_similarity, 3),
                    "category": product_category,
                    "detected_category": query_category,
                    "product_colors": [self._get_color_name(color) for color, _ in product_colors[:2]],
                    "query_colors": color_names[:2]
                }))
            
            # 5. Get top K results
            combined_scores.sort(key=lambda x: x[1], reverse=True)
            top_results = combined_scores[:3]  # Only take top 3 results
            
            # 6. Fetch product details and return
            result_products = []
            for product_id, score, metrics in top_results:
                product = await self.database.products.find_one({"_id": ObjectId(product_id)})
                if product:
                    product["_id"] = str(product["_id"])
                    product["similarity_score"] = round(float(score), 3)
                    product["similarity_metrics"] = metrics
                    result_products.append(product)
            
            return result_products
                
        except Exception as e:
            logger.error(f"Exception occurred: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")