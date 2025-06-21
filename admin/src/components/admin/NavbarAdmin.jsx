"use client"
import React, { useState, useEffect } from 'react'
import { Sun, Moon, LogOut } from 'lucide-react'

const NavbarAdmin = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved theme preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) {
        return JSON.parse(saved)
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Save preference
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const cardClasses = "bg-white dark:bg-gray-900 shadow-sm"

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = () => {
    // Add your logout logic here
    const confirmLogout = window.confirm('Are you sure you want to logout?')
    if (confirmLogout) {
      // Clear any auth tokens, user data, etc.
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      
      // Redirect to login page or handle logout
      console.log('Logging out...')
      // Example: window.location.href = '/login'
      // Or if using React Router: navigate('/login')
    }
  }

  return (
    <div>
      <nav className={`${cardClasses} border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50`}>
        <div className="flex items-center gap-5">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-sm">P</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Plan to Empower</h1>
          </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900 dark:text-white hidden sm:block">Admin</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default NavbarAdmin