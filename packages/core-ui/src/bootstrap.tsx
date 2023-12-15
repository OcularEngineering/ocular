import React from "react"
import ReactDOM from "react-dom/client"
import "./assets/styles/global.css"
import App from "./App"
import { Providers } from "./providers/providers"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Providers>
    <App />
    </Providers>
  </React.StrictMode>
)

