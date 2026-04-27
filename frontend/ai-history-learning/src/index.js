import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import { GoogleOAuthProvider } from '@react-oauth/google';


const clientId = "512876385864-pr6b1jo3okv0oph1eollaech10ior47j.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  
  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);