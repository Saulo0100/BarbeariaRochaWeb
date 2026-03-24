import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { appConfig } from "./config";

// Injeta as cores do tema antes do React renderizar (sem flash)
const root = document.documentElement;
root.style.setProperty("--brand-primary", appConfig.tema.primaryColor);
root.style.setProperty("--brand-secondary", appConfig.tema.secondaryColor);

createRoot(document.getElementById("root")!).render(<App />);
