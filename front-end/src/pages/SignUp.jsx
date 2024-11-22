import modelsImage from "../Assets/photoshootaesthetic.jpeg";

function SignUp() {
  return (
    <>
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Form Section */}
        <div className="bg-zinc-200 w-full lg:w-[55%] flex items-center justify-center h-[60%] lg:h-full">
          <div className="w-[90%] lg:w-[60%] bg-[#515151] rounded-md drop-shadow-lg p-8">
            <h1 className="text-3xl lg:text-4xl text-white font-bold mb-8">
              Sign Up.
            </h1>
            <div className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="flex flex-col">
                <label className="text-white text-sm mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  placeholder="Email"
                  className="text-black pl-2 py-2 rounded-sm"
                  type="email"
                />
              </div>

              {/* Username Input */}
              <div className="flex flex-col">
                <label className="text-white text-sm mb-1" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  placeholder="Username"
                  className="text-black pl-2 py-2 rounded-sm"
                  type="text"
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col">
                <label className="text-white text-sm mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  placeholder="Password"
                  className="text-black pl-2 py-2 rounded-sm"
                  type="password"
                />
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col">
                <label
                  className="text-white text-sm mb-1"
                  htmlFor="confirm-password"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  placeholder="Confirm Password"
                  className="text-black pl-2 py-2 rounded-sm"
                  type="password"
                />
              </div>

              {/* Register Button and Login Link */}
              <div className="mt-8 flex flex-col items-center">
                <button className="w-full lg:w-[40%] py-2 bg-black text-white rounded-md">
                  Register
                </button>
                <a href="" className="mt-4 text-white text-sm">
                  Already have an account? Click here to <b>login</b>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-[45%] h-[40%] lg:h-full relative">
          <img
            className="object-cover w-full h-full"
            src={modelsImage}
            alt="models"
          />
          <div className="absolute top-8 left-8 lg:left-16 text-black">
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-none">
              SMART
            </h1>
            <h1 className="tracking-[0.5em] lg:tracking-[1.1em] text-3xl lg:text-4xl font-bold leading-tight -mt-1">
              Wear
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
