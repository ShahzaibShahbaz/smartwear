// src/components/ProductCart.jsx
import React from 'react';

function ProductCart({ product, updateQuantity }) {
  const handleQuantityChange = (event) => {
    const newQuantity = parseInt(event.target.value, 10);
    updateQuantity(product.product_id, newQuantity);
  };

  return (
    <div className="flex flex-col w-[48rem] ml-4">
      <div className="flex">
        <div className="w-20 h-[7.5rem]">
          <img
            src={product.image || "https://via.placeholder.com/150"}
            className="h-full w-full object-cover"
            alt={product.product_name}
          />
        </div>
        <div className="pl-2 flex flex-col">
          <h2 className="text-xl">{product.product_name}</h2>
          <p className="text-[0.6rem] mt-0">Color: {product.color}</p>
          <p className="text-[0.6rem] mt-0">Size: {product.size}</p>
          <p className="text-[0.6rem] mt-0">{product.stock > 0 ? "In stock" : "Out of stock"}</p>
        </div>
        <div className="pl-6 flex flex-col">
          <h2 className="text-xl">Price</h2>
          <p className="text-[0.6rem] mt-0 font-bold">{product.price}</p>
        </div>
        <div className="pl-7">
          <h2 className="text-xl">Quantity</h2>
          <input
            type="number"
            className="w-[6rem] border"
            value={product.quantity}
            min="1"
            onChange={handleQuantityChange}
          />
        </div>
        <div className="pl-9">
          <h2 className="text-xl">Total Price</h2>
          <p className="text-[0.6rem] mt-0 font-bold">{product.quantity * product.price}</p>
        </div>
      </div>
      <hr className="border mt-10 border-gray-300" />
    </div>
  );
}

// Ensure this is the default export
export default ProductCart;
