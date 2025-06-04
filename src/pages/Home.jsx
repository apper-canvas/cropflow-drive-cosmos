import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import { fieldService } from '../services'

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [weatherData, setWeatherData] = useState({
    temperature: 24,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: "Today", high: 24, low: 18, rain: 20 },
      { day: "Tomorrow", high: 26, low: 19, rain: 10 },
      { day: "Wed", high: 28, low: 21, rain: 5 },
      { day: "Thu", high: 25, low: 20, rain: 30 },
      { day: "Fri", high: 23, low: 17, rain: 60 }
    ]
  })
  const [quickStats, setQuickStats] = useState({
    totalFields: 0,
    activeTasks: 12,
    lowStockItems: 3,
    harvestReady: 2
  })

  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadFields = async () => {
      setLoading(true)
      try {
        const result = await fieldService.getAll()
        setFields(result || [])
        setQuickStats(prev => ({ ...prev, totalFields: result?.length || 0 }))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadFields()
loadFields()
  }, [])

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-earth-100 dark:from-earth-900 dark:to-earth-800">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-earth-800 dark:text-earth-100 mb-2">
                Good morning! ☀️
              </h1>
              <p className="text-earth-600 dark:text-earth-300 text-sm sm:text-base">
                Here's what's happening on your farm today
              </p>
            </div>
            
{/* Weather Widget */}
            <div className="glass-morphism rounded-2xl p-4 sm:p-6 min-w-0 lg:min-w-[320px]">
              {/* Date and Time Display */}
              <div className="text-center mb-4 pb-3 border-b border-earth-200 dark:border-earth-600">
                <p className="text-lg font-semibold text-earth-800 dark:text-earth-100">
                  {currentDateTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {currentDateTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ApperIcon name="Cloud" className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold text-earth-800 dark:text-earth-100 text-lg">
                      {weatherData.temperature}°C
                    </p>
                    <p className="text-sm text-earth-600 dark:text-earth-300">
                      {weatherData.condition}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-earth-600 dark:text-earth-300">
                  <p>💧 {weatherData.humidity}%</p>
                  <p>🌪️ {weatherData.windSpeed} km/h</p>
                </div>
              </div>
              
              {/* 5-day forecast */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center">
                      <p className="text-xs text-earth-600 dark:text-earth-400 mb-1">{day.day}</p>
                      <p className="text-sm font-medium text-earth-800 dark:text-earth-200">
                        {day.high}°
                      </p>
                      <p className="text-xs text-earth-500 dark:text-earth-400">{day.low}°</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{day.rain}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { label: "Total Fields", value: quickStats.totalFields, icon: "MapPin", color: "text-primary" },
            { label: "Active Tasks", value: quickStats.activeTasks, icon: "CheckSquare", color: "text-blue-600" },
            { label: "Low Stock Items", value: quickStats.lowStockItems, icon: "AlertTriangle", color: "text-orange-600" },
            { label: "Harvest Ready", value: quickStats.harvestReady, icon: "Wheat", color: "text-green-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-4 sm:p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-earth-600 dark:text-earth-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-earth-800 dark:text-earth-100">
                    {stat.value}
                  </p>
                </div>
                <ApperIcon name={stat.icon} className={`h-8 w-8 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Feature */}
        <motion.div variants={itemVariants}>
          <MainFeature />
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                Recent Activity
              </h3>
              <button className="text-primary hover:text-primary-dark transition-colors text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: "Droplets", action: "Irrigation completed", field: "North Field - Corn", time: "2 hours ago", color: "text-blue-600" },
                { icon: "Truck", action: "Fertilizer applied", field: "South Field - Wheat", time: "4 hours ago", color: "text-green-600" },
                { icon: "AlertCircle", action: "Low seed inventory", field: "Soybean seeds", time: "6 hours ago", color: "text-orange-600" },
                { icon: "CheckCircle", action: "Harvest completed", field: "East Field - Barley", time: "1 day ago", color: "text-primary" }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-earth-100 dark:bg-earth-700 ${activity.color}`}>
                    <ApperIcon name={activity.icon} className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-earth-800 dark:text-earth-100 text-sm sm:text-base">
                      {activity.action}
                    </p>
                    <p className="text-earth-600 dark:text-earth-400 text-xs sm:text-sm truncate">
                      {activity.field}
                    </p>
                  </div>
                  <p className="text-earth-500 dark:text-earth-400 text-xs sm:text-sm whitespace-nowrap">
                    {activity.time}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Home