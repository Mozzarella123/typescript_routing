import React from 'react';
import ReactDOM from "react-dom/client";
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES_CONFIG } from "./navigation";


const router = createBrowserRouter([ROUTES_CONFIG]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
