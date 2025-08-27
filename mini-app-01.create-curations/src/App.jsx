import Main from "./Pages/Main";
import ToastMessages from "./Components/ToastMessages";
import "./Styles/root.css";
import "./Styles/icons.css";
import "./Styles/animations.css";
import "./Styles/essentials.css";
import "./Styles/custom.css";
import "./Styles/mobile.css";

function App() {
  return (
    <>
      <ToastMessages />
      <div>
        <Main />
      </div>
    </>
  );
}

export default App;
