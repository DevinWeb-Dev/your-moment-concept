import React from "react";

import ReactDOM from "react-dom/client";

import {
  HashRouter,
} from "react-router-dom";

import App from "./App.jsx";

import AppErrorBoundary from "./components/AppErrorBoundary.jsx";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </AppErrorBoundary>
  </React.StrictMode>
);