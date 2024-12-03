import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductDetails from "../components/ProductDetails";
import Buying from "../components/Buying";

// Mock data or replace with API call

function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  return (
    <div>
      <Navbar />
      <div className="p-8">
        <Buying product={product} />
      </div>
    </div>
  );
}

export default Product;
