import Navbar from '../components/Navbar';
import React from 'react';
import ProductDetails from '../components/ProductDetails';
import modelsImage from "../Assets/photoshootaesthetic.jpeg";

function Product(){

    const product = {
        name:"Meri shirt",
        price: 99.9,
        description: "Relaxed-fit t-shirt. Camp collar and short sleeves. Button-up front.",
        images: [
            modelsImage,
            modelsImage,
            modelsImage,
            modelsImage
        ],
        sizes: ["S", "M", "L", "XL"]
    };
    return(
        <>
        <div>
        <Navbar />
        <div className="p-8">
            <ProductDetails product = {product}/>
        </div>
        </div>
        </>
    )
    }
    export default Product;
