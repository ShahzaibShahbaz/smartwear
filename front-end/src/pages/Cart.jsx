import Navbar from "../components/Navbar";
import ProductCart from "../components/ProductCart";
import Checkout from "../components/Checkout";
function Cart() {
  return (
    <>
      <Navbar />
      <h1 className="mt-20 text-5xl items-center text-center font-bold">
        My Cart
      </h1>
      <div className="flex">
        <div className="flex flex-col">
          <div className="mt-12 ">
            <ProductCart />
            <ProductCart />
          </div>
        </div>
        <div>
          <Checkout />
        </div>
      </div>
    </>
  );
}

export default Cart;
