import kids from "../Assets/kids.jpg";
function ProductCart() {
  return (
    <>
      <div className="flex flex-col w-[48rem]  ml-4">
        <div className="flex">
          <div className="w-20 h-[7.5rem]">
            <img src={kids} className="h-full w-full object-cover"></img>
          </div>
          <div className="pl-2 flex flex-col ">
            <h2 className="text-xl">Product-Name</h2>
            <p className="text-[0.6rem] mt-0">Color: White</p>
            <p className="text-[0.6rem] mt-0">Size: XS</p>
            <p className="text-[0.6rem] mt-0">In stock</p>
          </div>
          <div className="pl-6 flex flex-col ">
            <h2 className="text-xl"> Price</h2>
            <p className="text-[0.6rem] mt-0 font-bold">77</p>
          </div>
          <div className="pl-7">
            <h2 className="text-xl">Quantity</h2>
            <input type="number" className="w-[6rem] border"></input>
          </div>
          <div className="pl-9">
            <h2 className="text-xl">Total Price</h2>
            <p className="text-[0.6rem] mt-0 font-bold"> 100</p>
          </div>
        </div>
        <hr className="border mt-10 border-gray-300" />
      </div>
    </>
  );
}
export default ProductCart;
