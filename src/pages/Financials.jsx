import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ReactApexCharts from 'react-apexcharts'
import ApperIcon from '../components/ApperIcon'
import { expenseService } from '../services'

const Financials = () => {
  const [expenses, setExpenses] = useState([])
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [filterBy, setFilterBy] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    field: '',
    date: '',
    notes: ''
  })

  useEffect(() => {
    loadExpenses()
    loadFields()
  }, [])

const loadExpenses = async () => {
    setLoading(true)
    try {
      const result = await expenseService.getAll()
      setExpenses(result || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const loadFields = async () => {
    try {
      const { fieldService } = await import('../services')
      const result = await fieldService.getAll()
      setFields(result || [])
    } catch (err) {
      console.error('Failed to load fields:', err)
      toast.error('Failed to load fields')
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    try {
      const result = await expenseService.create(newExpense)
      setExpenses(prev => [...prev, result])
      setNewExpense({ description: '', amount: '', category: '', field: '', date: '', notes: '' })
      setShowAddModal(false)
      toast.success('Expense added successfully!')
    } catch (err) {
      toast.error('Failed to add expense')
    }
  }

  const handleEditExpense = async (e) => {
    e.preventDefault()
    try {
      const result = await expenseService.update(editingExpense.id, editingExpense)
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? result : e))
      setEditingExpense(null)
      toast.success('Expense updated successfully!')
    } catch (err) {
      toast.error('Failed to update expense')
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.delete(expenseId)
        setExpenses(prev => prev.filter(e => e.id !== expenseId))
        toast.success('Expense deleted successfully!')
      } catch (err) {
        toast.error('Failed to delete expense')
      }
    }
  }

  const filteredExpenses = expenses
    .filter(expense => {
      if (filterBy === 'all') return true
      return expense.category === filterBy
    })
    .filter(expense => 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.field.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'amount') return parseFloat(b.amount) - parseFloat(a.amount)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
  const monthlyExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date)
      const currentMonth = new Date()
      return expenseDate.getMonth() === currentMonth.getMonth() && 
             expenseDate.getFullYear() === currentMonth.getFullYear()
    })
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

  // Group expenses by category for chart
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount)
    return acc
  }, {})

  const chartData = {
    series: Object.values(expensesByCategory),
    options: {
      chart: {
        type: 'donut',
        background: 'transparent'
      },
      labels: Object.keys(expensesByCategory),
      colors: ['#228B22', '#32CD32', '#FFB347', '#8B4513', '#CD853F', '#FF6B6B'],
      legend: {
        position: 'bottom',
        labels: {
          colors: '#6B7280'
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(1) + '%'
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return '$' + val.toFixed(2)
          }
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  }

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'seeds': return 'Sprout'
      case 'fertilizer': return 'Droplets'
      case 'equipment': return 'Wrench'
      case 'labor': return 'Users'
      case 'fuel': return 'Fuel'
      case 'maintenance': return 'Settings'
      default: return 'DollarSign'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 to-earth-100 dark:from-earth-900 dark:to-earth-800 flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="Loader2" className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-earth-600 dark:text-earth-300">Loading financial data...</p>
        </div>
      </div>
    )
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
                Financial Tracking
              </h1>
              <p className="text-earth-600 dark:text-earth-300 text-sm sm:text-base">
                Analyze costs per field and crop to optimize your farm's profitability
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover"
            >
              <ApperIcon name="Plus" className="h-5 w-5 inline mr-2" />
              Add Expense
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-earth-600 dark:text-earth-400 text-sm mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-earth-800 dark:text-earth-100">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <ApperIcon name="DollarSign" className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-earth-600 dark:text-earth-400 text-sm mb-1">This Month</p>
                <p className="text-2xl font-bold text-earth-800 dark:text-earth-100">
                  ${monthlyExpenses.toFixed(2)}
                </p>
              </div>
              <ApperIcon name="Calendar" className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-earth-600 dark:text-earth-400 text-sm mb-1">Avg per Expense</p>
                <p className="text-2xl font-bold text-earth-800 dark:text-earth-100">
                  ${expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <ApperIcon name="TrendingUp" className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Chart and Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Expense Distribution Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
              <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                Expense Distribution
              </h3>
              {Object.keys(expensesByCategory).length > 0 ? (
                <ReactApexCharts 
                  options={chartData.options} 
                  series={chartData.series} 
                  type="donut" 
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-earth-500 dark:text-earth-400">
                  <div className="text-center">
                    <ApperIcon name="PieChart" className="h-12 w-12 mx-auto mb-2" />
                    <p>No expense data available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
              <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                Filter & Search
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Search Expenses
                  </label>
                  <div className="relative">
                    <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-earth-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by description, category, or field..."
                      className="w-full pl-10 pr-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Filter by Category
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="seeds">Seeds</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="equipment">Equipment</option>
                    <option value="labor">Labor</option>
                    <option value="fuel">Fuel</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Expenses List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 bg-earth-100 dark:bg-earth-700 rounded-lg">
                    <ApperIcon name={getCategoryIcon(expense.category)} className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100">
                        {expense.description}
                      </h3>
                      <span className="text-xl font-bold text-red-600 ml-4">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </span>
                    </div>
                    
                    <p className="text-earth-600 dark:text-earth-400 text-sm mb-3">
                      {expense.notes}
                    </p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Tag" className="h-4 w-4 text-earth-500" />
                        <span className="text-earth-600 dark:text-earth-400 capitalize">
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="MapPin" className="h-4 w-4 text-earth-500" />
                        <span className="text-earth-600 dark:text-earth-400">
                          {expense.field}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Calendar" className="h-4 w-4 text-earth-500" />
                        <span className="text-earth-600 dark:text-earth-400">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingExpense(expense)}
                    className="bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 px-4 py-2 rounded-lg hover:bg-earth-200 dark:hover:bg-earth-600 transition-colors text-sm font-medium"
                  >
                    <ApperIcon name="Edit2" className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Expense Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Add New Expense
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="seeds">Seeds</option>
                      <option value="fertilizer">Fertilizer</option>
                      <option value="equipment">Equipment</option>
                      <option value="labor">Labor</option>
                      <option value="fuel">Fuel</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                
<div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Field
                    </label>
                    <select
                      value={newExpense.field}
                      onChange={(e) => setNewExpense({...newExpense, field: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select field</option>
                      {fields.map((field) => (
                        <option key={field.id} value={field.name}>
                          {field.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optional notes about this expense..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Expense Modal */}
        {editingExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Edit Expense
                </h3>
                <button
                  onClick={() => setEditingExpense(null)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingExpense.description}
                    onChange={(e) => setEditingExpense({...editingExpense, description: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({...editingExpense, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Category
                    </label>
                    <select
                      value={editingExpense.category}
                      onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="seeds">Seeds</option>
                      <option value="fertilizer">Fertilizer</option>
                      <option value="equipment">Equipment</option>
                      <option value="labor">Labor</option>
                      <option value="fuel">Fuel</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                
<div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Field
                    </label>
                    <select
                      value={editingExpense.field}
                      onChange={(e) => setEditingExpense({...editingExpense, field: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select field</option>
                      {fields.map((field) => (
                        <option key={field.id} value={field.name}>
                          {field.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editingExpense.date}
                      onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editingExpense.notes}
                    onChange={(e) => setEditingExpense({...editingExpense, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optional notes about this expense..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingExpense(null)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Financials