import logo from "./logo.svg";
import "./App.css";
import Register from "./components/Register";
import modelsImage from "./Assets/photoshootaesthetic.jpeg";

function App() {
  return (
    <>
      <Register imageprop={modelsImage} />
    </>
  );
}

export default App;
