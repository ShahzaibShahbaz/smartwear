# Smart Wear

## 📋 Overview

Smart Wear is an innovative online clothing platform that revolutionizes the e-commerce shopping experience through cutting-edge AI and AR technologies. The platform enables users to search for clothing using images, try on items virtually with AR, and receive personalized styling recommendations through an AI-powered chatbot.

## ✨ Key Features

- **Image-Based Search**: Upload images to find similar clothing items in our catalog
- **Virtual Try-On**: See how clothing items look on you before purchasing
- **AI Stylist Chatbot**: Get personalized fashion recommendations based on your preferences
- **User Authentication**: Secure account creation and management
- **Product Catalog**: Browse a wide range of fashion items with detailed filtering options
- **Shopping Cart & Wishlist**: Save items for later or proceed to checkout
- **Admin Dashboard**: Manage products, users, and orders

## 🛠️ Technology Stack

### Frontend

- React.js
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication
- Chart.js for analytics visualization

### Backend

- FastAPI (Python)
- MongoDB for database
- JWT authentication
- Bcrypt for password hashing

### AI/ML Components

- PyTorch for image recognition models
- OpenCV for image processing
- Google Generative AI for chat functionality
- TensorFlow for AI recommendation system

### Additional Tools

- TensorFlow for neural network models
- CLIP model for image similarity search

## 📦 Installation

### Prerequisites

- Node.js (v18.x or later)
- Python (v3.10 or later)
- MongoDB

### Setting up the Backend

```bash
# Clone the repository
git clone https://github.com/ShahzaibShahbaz/smartwear.git
cd smartwear/back-end

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

### Setting up the Frontend

```bash
# Navigate to the frontend directory
cd ../front-end

# Install dependencies
npm install

# Start the development server
npm start
```

## 🚀 Usage

1. **Browse Products**: Explore our catalog of clothing items
2. **Image Search**: Upload an image to find similar items
3. **Virtual Try-On**: Try on clothes virtually to see how items look on you
4. **AI Stylist**: Chat with our AI assistant for personalized recommendations
5. **Create an Account**: Register to save your preferences and manage orders
6. **Checkout**: Complete your purchase with our secure payment system

## 🔍 Project Structure

## 🔍 Project Structure

```
smartwear/
├── back-end/                 # FastAPI backend
│   ├── app/                  # Application modules
│   │   ├── routes/           # API endpoints including admin, cart, chatbot, etc.
│   │   ├── schemas/          # Data schemas for validation
│   │   └── services/         # Services for auth, image search, etc.
│   ├── venv/                 # Virtual environment
│   ├── database.py           # Database connection
│   ├── main.py               # Entry point for the application
│   └── requirements.txt      # Python dependencies
├── front-end/                # React frontend
│   ├── node_modules/         # Node.js modules
│   ├── public/               # Static files
│   ├── src/                  # Source code
│   │   ├── api/              # API integration
│   │   ├── Assets/           # Image assets
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin dashboard pages
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── shopping/     # Main shopping pages
│   │   │   └── VTO/          # Virtual Try-On pages
│   │   ├── store/            # Redux store with slices
│   │   └── utils/            # Utility functions
│   ├── .gitignore            # Git ignore file
│   └── package.json          # Node.js dependencies
└── README.md                 # Project documentation
```

## 👥 Team

This project was developed as a Final Year Project by Computer Science students at the National University of Computer and Emerging Sciences, Lahore:

- Muhammad Abdullah (21L-5456)
- Mohammad Shahzaib Shahbaz (21L-5378)
- Zaid Abdur Rahman (21L-5355)

Under the supervision of Mr. Syed Uzair Hussain Naqvi.


## 🙏 Acknowledgements

- Special thanks to our project supervisor and department faculty for their guidance
- Thanks to the open-source community for the tools and libraries that made this project possible
- Inspired by the SDG goal of Industry, Innovation, and Infrastructure

---
