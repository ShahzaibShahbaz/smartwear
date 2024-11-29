import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Navbar from "../components/Navbar";
import ProductCart from "../components/ProductCart";
import Checkout from "../components/Checkout";
import { setCartItems, updateQuantity } from "../store/cartSlice";

function Cart() {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // Fetch cart data from the backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Use dynamic user ID from Redux state
        const response = await axios.get(
          `http://127.0.0.1:8000/cart/${user?.id}`
        );
        dispatch(setCartItems(response.data.items)); // Update cart in Redux store
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (user) {
      fetchCart();
    }
  }, [user, dispatch]);

  // Function to update product quantity
  const handleUpdateQuantity = async (productId, quantity) => {
    dispatch(updateQuantity({ product_id: productId, quantity }));

    // Sync with the backend
    try {
      await axios.put(`http://127.0.0.1:8000/cart/${user?.id}`, {
        user_id: user?.id,
        items: products,
      });
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  return (
    <>
      <Navbar />
      <h1 className="mt-20 text-5xl items-center text-center font-bold">
        My Cart
      </h1>
      <div className="flex">
        {/* Left Section: Product List */}
        <div className="flex flex-col">
          <div className="mt-12">
            {products.map((product) => (
              <ProductCart
                key={product.product_id}
                product={product}
                updateQuantity={handleUpdateQuantity}
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
