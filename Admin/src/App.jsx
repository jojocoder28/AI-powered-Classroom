import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css'
import './index.css'
import AdminUserPage from './pages/AdminUserPage'

function App() {
  const router = createBrowserRouter([
    
    {
      path: "/adminnew",         // ⬅️ NEW route
      element: <AdminUserPage/>
    }
  ])
  return (
    <div className='App'>
<RouterProvider router={router}/>
    </div>
  )
}


export default App
