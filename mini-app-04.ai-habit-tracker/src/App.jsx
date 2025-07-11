import Main from "./Pages/Main";
import ToastMessages from "./Components/ToastMessages";
import "./Styles/root.css";
import "./Styles/essentials.css";
import "./Styles/custom.css";

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
