import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-earth-100 dark:from-earth-900 dark:to-earth-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8"
        >
          <ApperIcon name="Wheat" className="h-24 w-24 text-primary mx-auto wheat-loading" />
        </motion.div>
        
        <h1 className="text-4xl sm:text-6xl font-bold text-earth-800 dark:text-earth-100 mb-4">
          404
        </h1>
        
        <h2 className="text-xl sm:text-2xl font-semibold text-earth-700 dark:text-earth-200 mb-4">
          Field Not Found
        </h2>
        
        <p className="text-earth-600 dark:text-earth-400 mb-8 max-w-md mx-auto">
          Looks like this field has been harvested or moved to a different location. 
          Let's get you back to your farm dashboard.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-earth hover:shadow-earth-hover"
        >
          <ApperIcon name="Home" className="h-5 w-5" />
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound