import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Checkout from "../components/Checkout";
import { setCartItems, updateQuantity } from "../store/cartSlice";

function Cart() {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        dispatch(setCartItems(response.data.items));
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (user && token) {
      fetchCart();
    }
  }, [user, token, dispatch]);

  const handleUpdateQuantity = async (productId, quantity, size) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/cart`,
        { product_id: productId, quantity, size },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(updateQuantity({ product_id: productId, quantity }));
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-10">My Cart</h1>
        {products.length === 0 ? (
          <div className="text-center text-xl text-gray-600">
            Your cart is empty
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-grow">
              {products.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  updateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
            <div className="w-full md:w-96">
              <Checkout />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
