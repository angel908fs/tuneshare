import React from 'react'
import ReactDom from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter } from 'react-router-dom'
// import {QueryClinent, QueryClientProvider } from '@tanstack/react-querty'

//const queryClient = new QueryClient();
//before App, add <QueryClientProvider client = {queryClient}>

ReactDom.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

