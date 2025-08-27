import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import SWHandler from "smart-widget-handler";
import { store } from "./Store/store.js";
import Main from "./Pages/Main";
import ToastMessages from "./Components/ToastMessages";
import "./Styles/root.css";
import "./Styles/essentials.css";
import "./Styles/custom.css";

function App() {
  const [hostUrl, setHostUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SWHandler.client.ready();
  }, []);

  useEffect(() => {
    // Listen for data from the host app
    const listener = SWHandler.client.listen((event) => {
      console.log("Event data received:", event.data);

      if (event.kind === "user-metadata") {
        setUserData(event.data.user);
        setHostUrl(event.data.host_origin);
        setIsLoading(false);
      }
    });

    return () => {
      // Cleanup function
      listener.close();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <h2>Connecting to Nostr...</h2>
        <p>Loading your profile and habits</p>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <div className="app">
        <ToastMessages />
        <Main userData={userData} hostUrl={hostUrl} />
      </div>
    </Provider>
  );
}

export default App;
