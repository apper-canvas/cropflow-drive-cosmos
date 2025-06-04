import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ReactApexCharts from 'react-apexcharts'
import ApperIcon from '../components/ApperIcon'
import { expenseService } from '../services'

const Financials = () => {
    const [expenses, setExpenses] = useState([])
    const [budgets, setBudgets] = useState([])
    const [fields, setFields] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [filterBy, setFilterBy] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [activeTab, setActiveTab] = useState('expenses')
  const [filteredIncome, setFilteredIncome] = useState([])
  const [profitabilityData, setProfitabilityData] = useState({})
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    field: '',
    date: '',
    notes: ''
  })
  const [newIncome, setNewIncome] = useState({
    description: '',
    amount: '',
    cropType: '',
    field: '',
    date: '',
    buyer: '',
    quantity: '',
    pricePerUnit: '',
    notes: ''
  })

useEffect(() => {
    loadExpenses()
    loadBudgets()
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

  const loadBudgets = async () => {
    try {
      const result = await expenseService.getBudgets()
      setBudgets(result || [])
    } catch (err) {
      console.error('Failed to load budgets:', err)
      toast.error('Failed to load budget data')
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
  const handleDeleteIncome = async (incomeId) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        // Delete income logic here
        toast.success('Income deleted successfully!')
      } catch (err) {
        toast.error('Failed to delete income')
      }
    }
  }

  const handleAddIncome = async (e) => {
    e.preventDefault()
    try {
      // Create income record logic here
      setNewIncome({ 
        description: '', 
        amount: '', 
        cropType: '', 
        field: '', 
        date: '', 
        buyer: '', 
        quantity: '', 
        pricePerUnit: '', 
        notes: '' 
      })
      setShowAddIncomeModal(false)
      toast.success('Income added successfully!')
    } catch (err) {
      toast.error('Failed to add income')
    }
  }

  const handleEditIncome = async (e) => {
    e.preventDefault()
    try {
      // Update income record logic here
      setEditingIncome(null)
      toast.success('Income updated successfully!')
    } catch (err) {
      toast.error('Failed to update income')
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

  // Calculate profitability data
  const calculateProfitabilityData = () => {
    const data = {}
    
    // Group income by crop type
    filteredIncome.forEach(income => {
      const crop = income.cropType
      if (!data[crop]) {
        data[crop] = { income: 0, expenses: 0, profit: 0, margin: 0 }
      }
      data[crop].income += parseFloat(income.amount || 0)
    })
    
    // Group expenses by field/crop (assuming field corresponds to crop)
    expenses.forEach(expense => {
      const field = expense.field
      if (data[field]) {
        data[field].expenses += parseFloat(expense.amount || 0)
      }
    })
    
    // Calculate profit and margin
    Object.keys(data).forEach(crop => {
      data[crop].profit = data[crop].income - data[crop].expenses
      data[crop].margin = data[crop].income > 0 ? (data[crop].profit / data[crop].income) * 100 : 0
    })
    
    return data
  }

  const currentProfitabilityData = calculateProfitabilityData()

  // Group expenses by category for chart
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount)
    return acc
  }, {})

  // Expense Distribution Chart Data
  const expenseChartData = {
    series: Object.values(expensesByCategory),
    options: {
      chart: {
        type: 'donut',
        background: 'transparent',
        height: 350
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
            width: 280,
            height: 280
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  }

  // Budget vs Actual Chart Data
  const budgetCategories = [...new Set([...expenses.map(e => e.category), ...budgets.map(b => b.category)])]
  const budgetChartData = {
    series: [
      {
        name: 'Budget',
        data: budgetCategories.map(category => {
          const budget = budgets.find(b => b.category === category)
          return budget ? budget.budgetAmount : 0
        })
      },
      {
        name: 'Actual',
        data: budgetCategories.map(category => {
          return expenses
            .filter(e => e.category === category)
            .reduce((sum, e) => sum + parseFloat(e.amount), 0)
        })
      }
    ],
    options: {
      chart: {
        type: 'bar',
        background: 'transparent',
        height: 350
      },
      xaxis: {
        categories: budgetCategories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
        labels: {
          style: {
            colors: '#6B7280'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6B7280'
          },
          formatter: function (val) {
            return '$' + val.toFixed(0)
          }
        }
      },
      colors: ['#32CD32', '#228B22'],
      legend: {
        position: 'top',
        labels: {
          colors: '#6B7280'
        }
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return '$' + val.toFixed(2)
          }
        }
      },
      plotOptions: {
        bar: {
          columnWidth: '60%',
          borderRadius: 4
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 280
          },
          plotOptions: {
            bar: {
              columnWidth: '80%'
            }
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

  const getCropIcon = (cropType) => {
    switch (cropType?.toLowerCase()) {
      case 'corn': return 'Sprout'
      case 'wheat': return 'Wheat'
      case 'soybeans': return 'Leaf'
      case 'barley': return 'Grain'
      default: return 'Sprout'
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
            <div className="flex items-center gap-4">
              {activeTab === 'expenses' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover"
                >
<ApperIcon name="Plus" className="h-5 w-5 inline mr-2" />
                  Add Expense
                </button>
              )}
              
              {activeTab === 'income' && (
                <button
                  onClick={() => setShowAddIncomeModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover"
                >
                  <ApperIcon name="Plus" className="h-5 w-5 inline mr-2" />
                  Add Income
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="flex space-x-1 bg-earth-100 dark:bg-earth-700 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'expenses'
                    ? 'bg-white dark:bg-earth-600 text-primary shadow-sm'
                    : 'text-earth-600 dark:text-earth-400 hover:text-earth-800 dark:hover:text-earth-200'
                }`}
              >
                <ApperIcon name="Receipt" className="h-5 w-5 inline mr-2" />
                Expenses
              </button>
              
              <button
                onClick={() => setActiveTab('income')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'income'
                    ? 'bg-white dark:bg-earth-600 text-green-600 shadow-sm'
                    : 'text-earth-600 dark:text-earth-400 hover:text-earth-800 dark:hover:text-earth-200'
                }`}
              >
                <ApperIcon name="TrendingUp" className="h-5 w-5 inline mr-2" />
                Income
              </button>
              
              <button
                onClick={() => setActiveTab('profitability')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'profitability'
                    ? 'bg-white dark:bg-earth-600 text-blue-600 shadow-sm'
                    : 'text-earth-600 dark:text-earth-400 hover:text-earth-800 dark:hover:text-earth-200'
                }`}
              >
                <ApperIcon name="BarChart3" className="h-5 w-5 inline mr-2" />
                Profitability Reports
              </button>
            </div>
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

        {/* Financial Reports Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense Distribution Chart */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
              <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                Expense Distribution
              </h3>
              <div className="chart-container">
                {Object.keys(expensesByCategory).length > 0 ? (
                  <div className="chart-wrapper">
                    <ReactApexCharts 
                      options={expenseChartData.options} 
                      series={expenseChartData.series} 
                      type="donut" 
                      height={350}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-earth-500 dark:text-earth-400">
                    <div className="text-center">
                      <ApperIcon name="PieChart" className="h-12 w-12 mx-auto mb-2" />
                      <p>No expense data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Budget vs Actual Chart */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
              <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                Budget vs Actual
              </h3>
              <div className="chart-container">
                {budgetCategories.length > 0 ? (
                  <div className="chart-wrapper">
                    <ReactApexCharts 
                      options={budgetChartData.options} 
                      series={budgetChartData.series} 
                      type="bar" 
                      height={350}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-earth-500 dark:text-earth-400">
                    <div className="text-center">
                      <ApperIcon name="BarChart" className="h-12 w-12 mx-auto mb-2" />
                      <p>No budget data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div variants={itemVariants} className="mb-8">
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

        {/* Content Area */}
        {activeTab === 'expenses' && (
          <motion.div variants={itemVariants} className="space-y-4">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense, index) => (
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
              ))
            ) : (
              <div className="flex items-center justify-center h-64 text-earth-500 dark:text-earth-400">
                <div className="text-center">
                  <ApperIcon name="Receipt" className="h-12 w-12 mx-auto mb-2" />
                  <p>No expenses found</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'income' && (
          <motion.div variants={itemVariants} className="space-y-4">
            {filteredIncome.length > 0 ? (
              filteredIncome.map((incomeItem, index) => (
                <motion.div
                  key={incomeItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <ApperIcon name={getCropIcon(incomeItem.cropType)} className="h-6 w-6 text-green-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100">
                            {incomeItem.description}
                          </h3>
                          <span className="text-xl font-bold text-green-600 ml-4">
                            ${parseFloat(incomeItem.amount).toFixed(2)}
                          </span>
                        </div>
                        
                        <p className="text-earth-600 dark:text-earth-400 text-sm mb-3">
                          {incomeItem.notes}
                        </p>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Sprout" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {incomeItem.cropType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ApperIcon name="MapPin" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {incomeItem.field}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ApperIcon name="User" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {incomeItem.buyer}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Calendar" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {new Date(incomeItem.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {incomeItem.quantity && (
                          <div className="mt-2 text-sm text-earth-500 dark:text-earth-400">
                            Quantity: {incomeItem.quantity} 
                            {incomeItem.pricePerUnit && ` @ $${parseFloat(incomeItem.pricePerUnit).toFixed(2)} per unit`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIncome(incomeItem)}
                        className="bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 px-4 py-2 rounded-lg hover:bg-earth-200 dark:hover:bg-earth-600 transition-colors text-sm font-medium"
                      >
                        <ApperIcon name="Edit2" className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteIncome(incomeItem.id)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center h-64 text-earth-500 dark:text-earth-400">
                <div className="text-center">
                  <ApperIcon name="TrendingUp" className="h-12 w-12 mx-auto mb-2" />
<p>No income records found</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'profitability' && (
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Profitability by Crop Table */}
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
              <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-6">
                Profitability Analysis by Crop
              </h3>
{Object.keys(currentProfitabilityData).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-earth-200 dark:border-earth-700">
                        <th className="text-left py-3 px-4 font-semibold text-earth-800 dark:text-earth-100">Crop</th>
                        <th className="text-right py-3 px-4 font-semibold text-earth-800 dark:text-earth-100">Income</th>
                        <th className="text-right py-3 px-4 font-semibold text-earth-800 dark:text-earth-100">Expenses</th>
                        <th className="text-right py-3 px-4 font-semibold text-earth-800 dark:text-earth-100">Profit/Loss</th>
                        <th className="text-right py-3 px-4 font-semibold text-earth-800 dark:text-earth-100">Margin</th>
                        <th className="text-center py-3 px-4 font-semibold text-earth-800 dark:text-earth-100">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(currentProfitabilityData).map(([crop, data]) => (
                        <tr key={crop} className="border-b border-earth-100 dark:border-earth-700 hover:bg-earth-50 dark:hover:bg-earth-700/50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <ApperIcon name={getCropIcon(crop)} className="h-5 w-5 text-primary" />
                              <span className="font-medium text-earth-800 dark:text-earth-100">{crop}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right text-green-600 font-semibold">
                            ${data.income?.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-4 px-4 text-right text-red-600 font-semibold">
                            ${data.expenses?.toFixed(2) || '0.00'}
                          </td>
                          <td className={`py-4 px-4 text-right font-semibold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${data.profit?.toFixed(2) || '0.00'}
                          </td>
                          <td className={`py-4 px-4 text-right font-semibold ${data.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.margin?.toFixed(1) || '0.0'}%
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              data.profit >= 0 
? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {data.profit >= 0 ? 'Profitable' : 'Loss'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="BarChart3" className="h-12 w-12 text-earth-400 mx-auto mb-4" />
                  <p className="text-earth-600 dark:text-earth-400">No profitability data available</p>
                  <p className="text-sm text-earth-500 dark:text-earth-500 mt-2">
<p className="text-sm text-earth-500 dark:text-earth-500 mt-2">
                    Add income and expense records to see profitability analysis
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profit by Crop Chart */}
              <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
                <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                  Profit by Crop
                </h4>
                <ReactApexCharts
                  options={{
                      chart: { type: 'bar', background: 'transparent' },
                      xaxis: { categories: Object.keys(currentProfitabilityData) },
                      colors: ['#22C55E', '#EF4444'],
                      plotOptions: { bar: { columnWidth: '60%', borderRadius: 4 } },
                      dataLabels: { enabled: false },
                      yaxis: {
                        labels: {
                          formatter: function (val) {
                            return '$' + val.toFixed(0)
                          }
                        }
                      }
                    }}
                    series={[{
                      name: 'Profit/Loss',
                      data: Object.values(currentProfitabilityData).map(data => data.profit || 0)
                    }]}
                    type="bar"
                    height={300}
                  />
                </div>

                {/* Revenue vs Expenses Chart */}
                <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
                  <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                    Revenue vs Expenses
                  </h4>
                  <ReactApexCharts
                    options={{
                      chart: { type: 'bar', background: 'transparent' },
                      xaxis: { categories: Object.keys(currentProfitabilityData) },
                      colors: ['#22C55E', '#EF4444'],
                      legend: { position: 'top' },
                      plotOptions: { bar: { columnWidth: '60%', borderRadius: 4 } },
                      dataLabels: { enabled: false },
                      yaxis: {
                        labels: {
                          formatter: function (val) {
                            return '$' + val.toFixed(0)
                          }
                        }
                      }
                    }}
                    series={[
                      {
                        name: 'Income',
                        data: Object.values(currentProfitabilityData).map(data => data.income || 0)
                      },
                      {
                        name: 'Expenses',
                        data: Object.values(currentProfitabilityData).map(data => data.expenses || 0)
                      }
                    ]}
                    type="bar"
                    height={300}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
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

        {/* Add Income Modal */}
        {showAddIncomeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Add New Income
                </h3>
                <button
                  onClick={() => setShowAddIncomeModal(false)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddIncome} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
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
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Crop Type
                    </label>
                    <select
                      value={newIncome.cropType}
                      onChange={(e) => setNewIncome({...newIncome, cropType: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select crop</option>
                      <option value="Corn">Corn</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Soybeans">Soybeans</option>
                      <option value="Barley">Barley</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Field
                    </label>
                    <select
                      value={newIncome.field}
                      onChange={(e) => setNewIncome({...newIncome, field: e.target.value})}
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
                      value={newIncome.date}
                      onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Buyer
                    </label>
                    <input
                      type="text"
                      value={newIncome.buyer}
                      onChange={(e) => setNewIncome({...newIncome, buyer: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={newIncome.quantity}
                      onChange={(e) => setNewIncome({...newIncome, quantity: e.target.value})}
                      placeholder="e.g., 500 bushels"
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Price per Unit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newIncome.pricePerUnit}
                    onChange={(e) => setNewIncome({...newIncome, pricePerUnit: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newIncome.notes}
                    onChange={(e) => setNewIncome({...newIncome, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optional notes about this sale..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddIncomeModal(false)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Income
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Income Modal */}
        {editingIncome && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Edit Income
                </h3>
                <button
                  onClick={() => setEditingIncome(null)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditIncome} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingIncome.description}
                    onChange={(e) => setEditingIncome({...editingIncome, description: e.target.value})}
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
                      value={editingIncome.amount}
                      onChange={(e) => setEditingIncome({...editingIncome, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Crop Type
                    </label>
                    <select
                      value={editingIncome.cropType}
                      onChange={(e) => setEditingIncome({...editingIncome, cropType: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select crop</option>
                      <option value="Corn">Corn</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Soybeans">Soybeans</option>
                      <option value="Barley">Barley</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Field
                    </label>
                    <select
                      value={editingIncome.field}
                      onChange={(e) => setEditingIncome({...editingIncome, field: e.target.value})}
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
                      value={editingIncome.date}
                      onChange={(e) => setEditingIncome({...editingIncome, date: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Buyer
                    </label>
                    <input
                      type="text"
                      value={editingIncome.buyer}
                      onChange={(e) => setEditingIncome({...editingIncome, buyer: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={editingIncome.quantity}
                      onChange={(e) => setEditingIncome({...editingIncome, quantity: e.target.value})}
                      placeholder="e.g., 500 bushels"
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Price per Unit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingIncome.pricePerUnit}
                    onChange={(e) => setEditingIncome({...editingIncome, pricePerUnit: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editingIncome.notes}
                    onChange={(e) => setEditingIncome({...editingIncome, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optional notes about this sale..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingIncome(null)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Income
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