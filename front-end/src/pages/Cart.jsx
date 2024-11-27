import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import ProductCart from "../components/ProductCart";
import Checkout from "../components/Checkout";

function Cart() {
  const [products, setProducts] = useState([]); // State to store products in the cart
  const [userId] = useState("12345"); // Replace with dynamic user ID if available

  // Fetch cart data from the backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/cart/${userId}`); // Adjust backend URL as needed
        setProducts(response.data.items); // Set products from backend response
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, [userId]);

  // Function to update product quantity
  const updateQuantity = async (productId, quantity) => {
    const updatedProducts = products.map((product) =>
      product.product_id === productId ? { ...product, quantity } : product
    );
    setProducts(updatedProducts); // Update state optimistically

    // Sync with the backend
    try {
      await axios.put(`http://127.0.0.1:8000/cart/${userId}`, {
        user_id: userId,
        items: updatedProducts,
      });
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  return (
    <>
      <Navbar />
      <h1 className="mt-20 text-5xl items-center text-center font-bold">My Cart</h1>
      <div className="flex">
        {/* Left Section: Product List */}
        <div className="flex flex-col">
          <div className="mt-12">
            {products.map((product) => (
              <ProductCart
                key={product.product_id}
                product={product}
                updateQuantity={updateQuantity}
              />
            ))}
          </div>
        </div>

        {/* Right Section: Checkout Summary */}
        <div>
          <Checkout products={products} />
        </div>
      </div>
    </>
  );
}

export default Cart;
