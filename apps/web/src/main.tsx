import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootswatch/dist/lux/bootstrap.min.css";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./style.css";

const storedTheme = window.localStorage.getItem("careeros-theme");
if (storedTheme === "dark" || storedTheme === "light") {
  document.documentElement.setAttribute("data-theme", storedTheme);
  document.documentElement.setAttribute("data-bs-theme", storedTheme);
}

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
