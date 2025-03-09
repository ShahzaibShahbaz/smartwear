import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Buying from "../../components/Buying";
import Footer from "../../components/Footer";

function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  return (
    <div>
      <Navbar />
      <div className="p-12">
        <Buying product={product} />
      </div>
      <Footer />
    </div>
  );
}

export default Product;
