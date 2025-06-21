"use client"
import React, { useState, useEffect } from 'react'
import { Home, Users, UserPlus, Database, DollarSign, Eye, BarChart3, LogOut, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const SidebarAdmin = ({ isOpen = true }) => {
  const router = useRouter()
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

  const [activeItem, setActiveItem] = useState('/admin/dashboard')


  

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

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: Home
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users
    },
    {
      name: 'Add Candidate',
      path: '/admin/addCandidate',
      icon: UserPlus
    },
    {
      name: 'Add Data',
      path: '/admin/donorData/addDonorData',
      icon: Database
    },
    {
      name: 'View Donor Data',
      path: '/admin/donorData',
      icon: Eye
    },
    {
      name: 'Distribute Donor Data',
      path: '/admin/distributeData',
      icon: Send
    },
    {
      name: 'Candidate Statistics',
      path: '/admin/candidateStatistics',
      icon: BarChart3
    }
  ]

  const handleNavigation = (path) => {
    setActiveItem(path);
    router.push(path); 
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Logged out successfully!");
        router.push("/");
      } else {
        toast.error(`Logout failed: ${data.message}`);
      }
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  if (!isOpen) return null

  return (
    <div className={`${cardClasses} border-r h-screen w-64 fixed left-0 top-0 z-40 overflow-y-auto`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">SuperAdmin </h2>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.path
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 mb-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Plan to Empower v1.0
        </div>
      </div>
    </div>
  )
}

export default SidebarAdmin