import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import { GoogleOAuthProvider } from '@react-oauth/google';


const clientId = import.meta.env.VITE_GG_CLIENT_ID;
console.log("GOOGLE CLIENT ID HIỆN TẠI LÀ:", clientId);

createRoot(document.getElementById("root")).render(
  
  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);