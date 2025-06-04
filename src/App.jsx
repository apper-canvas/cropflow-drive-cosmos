import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import Fields from './pages/Fields'
import Resources from './pages/Resources'
import Tasks from './pages/Tasks'
import Financials from './pages/Financials'
import EquipmentMaintenance from './pages/EquipmentMaintenance'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'
import ApperIcon from './components/ApperIcon'
function App() {
  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-earth-50 dark:bg-earth-900 min-h-screen">
        {/* Navigation */}
        <nav className="bg-white dark:bg-earth-800 shadow-earth border-b border-earth-200 dark:border-earth-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="bg-primary p-2 rounded-xl">
                  <ApperIcon name="Wheat" className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-primary dark:text-primary-light">CropFlow</h1>
              </div>

{/* Navigation Items */}
              <div className="hidden md:flex items-center space-x-6">
                <Link 
                  to="/" 
                  className={`transition-colors ${
                    location.pathname === '/' 
                      ? 'text-primary font-medium' 
                      : 'text-earth-700 dark:text-earth-300 hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/fields" 
                  className={`transition-colors ${
                    location.pathname === '/fields' 
                      ? 'text-primary font-medium' 
                      : 'text-earth-700 dark:text-earth-300 hover:text-primary'
                  }`}
                >
                  Fields
                </Link>
                <Link 
                  to="/resources" 
                  className={`transition-colors ${
                    location.pathname === '/resources' 
                      ? 'text-primary font-medium' 
                      : 'text-earth-700 dark:text-earth-300 hover:text-primary'
                  }`}
                >
                  Resources
                </Link>
                <Link 
                  to="/tasks" 
                  className={`transition-colors ${
                    location.pathname === '/tasks' 
                      ? 'text-primary font-medium' 
                      : 'text-earth-700 dark:text-earth-300 hover:text-primary'
                  }`}
                >
                  Tasks
                </Link>
                <Link 
                  to="/financials" 
                  className={`transition-colors ${
                    location.pathname === '/financials' 
                      ? 'text-primary font-medium' 
                      : 'text-earth-700 dark:text-earth-300 hover:text-primary'
                  }`}
>
                  Financials
                </Link>
                <Link 
                  to="/equipment-maintenance" 
                  className={`transition-colors ${
                    location.pathname === '/equipment-maintenance' 
                      ? 'text-primary font-medium' 
                      : 'text-earth-700 dark:text-earth-300 hover:text-primary'
                  }`}
                >
                  Equipment
                </Link>
                <Link 
                  to="/reports" 
                  className={`transition-colors ${
                    location.pathname === '/reports' 
                      ? 'text-primary font-medium' 
                      : 'text-earth-700 dark:text-earth-300 hover:text-primary'
                  }`}
                >
                  Reports
                </Link>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600 transition-all"
                >
                  <ApperIcon name={darkMode ? "Sun" : "Moon"} className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600 transition-all">
                  <ApperIcon name="Bell" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

{/* Main Content */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/resources" element={<Resources />} />
<Route path="/tasks" element={<Tasks />} />
<Route path="/financials" element={<Financials />} />
          <Route path="/equipment-maintenance" element={<EquipmentMaintenance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
          className="mt-16"
          toastClassName="shadow-earth-hover"
        />
      </div>
    </div>
  )
}

export default App