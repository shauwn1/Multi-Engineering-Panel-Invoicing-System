// client/src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.js"; // Note it imports app.js, not App.jsx

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);