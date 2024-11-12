import modelsImage from "../Assets/photoshootaesthetic.jpeg";
function SignUp() {
  return (
    <>
      <div className="flex">
        <div className="w-[45%] max-h-screen overflow-hidden relative">
          <img className="object-cover" src={modelsImage} alt="models" />
          <div className="absolute ml-6 top-2 left-2 text-black">
            <h1 className=" ml-[5.5%] text-6xl font-extrabold leading-none">
              SMART
            </h1>
            <h1 className="tracking-[1.1em]  text-4xl ml-[7%] font-bold leading-tight -mt-2">
              Wear
            </h1>
          </div>
        </div>
        <div className="bg-zinc-200 w-[55%] items-center justify-center flex h-screen">
          <div className="w-[60%] h-[80%] bg-[#515151] rounded-md drop-shadow-lg">
            <h1 className="ml-12 mt-12 text-4xl text-white font-bold">
              Sign Up.
            </h1>
            <div className="flex flex-col gap-6 ml-[8.4%] mt-[8.4%] w-[82%]">
              <div className="flex flex-col justify-center ">
                <h1 className="text-white text-1xl">Email</h1>
                <input
                  placeholder="Email"
                  className=" text-black pl-1 rounded-sm"
                  type="email"
                ></input>
              </div>
              <div className="flex flex-col justify-center  gp-2">
                <h1 className="text-white text-1xl">Username</h1>
                <input
                  placeholder="username"
                  className=" text-black pl-1 rounded-sm"
                  type="text"
                ></input>
              </div>
              <div className="flex flex-col justify-center  gp-2">
                <h1 className="text-white text-1xl">Password</h1>
                <input
                  placeholder="Password"
                  className=" text-black pl-1 rounded-sm"
                  type="password"
                ></input>
              </div>
              <div className="flex flex-col justify-center  gp-2">
                <h1 className="text-white text-1xl">Confirm Password</h1>
                <input
                  placeholder="password"
                  className=" text-black pl-1 rounded-sm"
                  type="password"
                ></input>
              </div>
              <div className="mt-[7%] flex flex-col items-center">
                <div className="border-black border-2 p-2 bg-black text-white text-center w-[20%] rounded-md ">
                  <button>Register</button>
                </div>
                <a href="" className="mt-[2.5%]  text-white">
                  Already have an account? Click here to <b>login</b>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default SignUp;
