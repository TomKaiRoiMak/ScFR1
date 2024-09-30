import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Tierlist from './components/Tierlist';


const router = createBrowserRouter([
  
  {
  path: '/',
  element: <Home />
  },
  
  {
  path: '/About',
  element: <About />
  },
  
  {
  path: '/Contact',
  element: <Contact />
  },

  {
  path: '/Tierlist',
  element: <Tierlist/>
  }
  
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
