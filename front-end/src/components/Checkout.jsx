function Checkout() {
  return (
    <>
      <div className="h-[30rem] w-[48rem] flex items-center justify-center">
        <div className=" flex flex-col border mt-12  h-[24rem] w-[24rem] pl-6 pr-7 drop-shadow-lg">
          <div className="flex justify-between mt-20">
            <h2 className="text-start">Total Items</h2>
            <h2 className="text-end">2</h2>
          </div>
          <div className="flex justify-between mt-7">
            <h1 className="text-start">Total Price</h1>
            <h1 className="text-end"> 88</h1>
          </div>
          <div className="flex items-center justify-center  mt-7 h-[4rem]">
            <button className="px-6 py-2 bg-black text-white rounded-md">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
