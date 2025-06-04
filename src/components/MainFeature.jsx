import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import { fieldService, taskService, resourceService } from '../services'

const MainFeature = () => {
const [activeTab, setActiveTab] = useState('fields')
  const [fields, setFields] = useState([])
  const [tasks, setTasks] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedField, setSelectedField] = useState(null)
  
  // Financial management states
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [selectedFinancialView, setSelectedFinancialView] = useState('overview')
  const [selectedCostField, setSelectedCostField] = useState('all')
  const [selectedCostCategory, setSelectedCostCategory] = useState('all')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'planting',
    fieldId: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: ''
  })

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'seeds',
    fieldId: '',
    date: new Date().toISOString().split('T')[0],
    cropType: ''
  })

  const [newBudget, setNewBudget] = useState({
    category: 'seeds',
    budgetAmount: '',
    fieldId: '',
    period: 'monthly',
    year: new Date().getFullYear()
  })

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
switch (activeTab) {
          case 'fields':
            const fieldsData = await fieldService.getAll()
            setFields(fieldsData || [])
            break
          case 'tasks':
            const tasksData = await taskService.getAll()
            setTasks(tasksData || [])
            break
          case 'resources':
            const resourcesData = await resourceService.getAll()
            setResources(resourcesData || [])
            break
          case 'financials':
            // Load financial data - expenses and budgets would be loaded from appropriate services
            setExpenses([])
            setBudgets([])
            break
        }
      } catch (err) {
        setError(err.message)
        toast.error(`Failed to load ${activeTab}`)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [activeTab])

  // Load fields for task form
  useEffect(() => {
    const loadFields = async () => {
      try {
        const fieldsData = await fieldService.getAll()
        setFields(fieldsData || [])
      } catch (err) {
        console.error('Failed to load fields for task form')
      }
    }
    if (showTaskForm && fields.length === 0) {
      loadFields()
    }
  }, [showTaskForm])

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    if (!newTask.title || !newTask.fieldId || !newTask.dueDate || !newTask.assignedTo) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const taskData = {
        ...newTask,
        status: 'pending'
      }
      const createdTask = await taskService.create(taskData)
      setTasks(prev => [createdTask, ...prev])
      setNewTask({ title: '', type: 'planting', fieldId: '', dueDate: '', priority: 'medium', assignedTo: '' })
      setShowTaskForm(false)
      toast.success('Task created successfully!')
    } catch (err) {
      toast.error('Failed to create task')
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const updatedTask = await taskService.update(taskId, { status: newStatus })
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task))
      toast.success(`Task ${newStatus}`)
    } catch (err) {
      toast.error('Failed to update task')
}
  }

  // Financial management functions
  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    if (!newExpense.description || !newExpense.amount || !newExpense.fieldId || !newExpense.date) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        id: Date.now().toString()
      }
      setExpenses(prev => [expenseData, ...prev])
      setNewExpense({
        description: '',
        amount: '',
        category: 'seeds',
        fieldId: '',
        date: new Date().toISOString().split('T')[0],
        cropType: ''
      })
      setShowExpenseForm(false)
      toast.success('Expense recorded successfully!')
    } catch (err) {
      toast.error('Failed to record expense')
    }
  }

  const handleBudgetSubmit = async (e) => {
    e.preventDefault()
    if (!newBudget.budgetAmount || !newBudget.fieldId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const budgetData = {
        ...newBudget,
        budgetAmount: parseFloat(newBudget.budgetAmount),
        id: Date.now().toString()
      }
      setBudgets(prev => [budgetData, ...prev])
      setNewBudget({
        category: 'seeds',
        budgetAmount: '',
        fieldId: '',
        period: 'monthly',
        year: new Date().getFullYear()
      })
      setShowBudgetForm(false)
      toast.success('Budget created successfully!')
    } catch (err) {
      toast.error('Failed to create budget')
    }
  }

  const deleteExpense = (expenseId) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId))
    toast.success('Expense deleted successfully!')
  }

  const getExpensesByField = (fieldId) => {
    return expenses.filter(expense => expense.fieldId === fieldId)
  }

  const getExpensesByCategory = (category) => {
    return expenses.filter(expense => expense.category === category)
  }

  const getExpenseChartData = () => {
    const categories = ['seeds', 'fertilizers', 'pesticides', 'labor', 'equipment', 'fuel', 'maintenance', 'other']
    const data = categories.map(category => {
      return expenses.filter(exp => exp.category === category).reduce((sum, exp) => sum + exp.amount, 0)
    })
    return {
      labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      series: data
    }
  }

  const getBudgetVsActual = () => {
    const categories = ['seeds', 'fertilizers', 'pesticides', 'labor', 'equipment', 'fuel', 'maintenance', 'other']
    const budgetData = categories.map(category => {
      return budgets.filter(budget => budget.category === category).reduce((sum, budget) => sum + budget.budgetAmount, 0)
    })
    const actualData = categories.map(category => {
      return expenses.filter(exp => exp.category === category).reduce((sum, exp) => sum + exp.amount, 0)
    })
    return {
      categories: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      budget: budgetData,
      actual: actualData
    }
  }

  const getFieldById = (fieldId) => {
    return fields.find(field => field.id === fieldId) || { name: 'Unknown Field' }
  }

  const getGrowthStageColor = (stage) => {
    const colors = {
      'seedling': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'vegetative': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'flowering': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'fruiting': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'harvest-ready': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
      'medium': 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      'high': 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
    }
    return colors[priority] || colors.medium
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    return colors[status] || colors.pending
  }

  const getStockStatus = (quantity, minimumStock) => {
    const ratio = quantity / minimumStock
    if (ratio <= 1) return { status: 'critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' }
    if (ratio <= 1.5) return { status: 'low', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20' }
    return { status: 'good', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' }
  }

const tabs = [
    { id: 'fields', label: 'Field Overview', icon: 'MapPin' },
    { id: 'tasks', label: 'Task Management', icon: 'CheckSquare' },
    { id: 'resources', label: 'Resource Inventory', icon: 'Package' },
    { id: 'financials', label: 'Financial Tracking', icon: 'DollarSign' }
  ]

  return (
    <div className="bg-white dark:bg-earth-800 rounded-2xl shadow-earth overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-earth-200 dark:border-earth-700">
        <div className="flex flex-col sm:flex-row">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary text-white border-b-2 border-primary'
                  : 'text-earth-600 dark:text-earth-400 hover:text-primary hover:bg-earth-50 dark:hover:bg-earth-700'
              }`}
            >
              <ApperIcon name={tab.icon} className="h-5 w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <ApperIcon name="Wheat" className="h-8 w-8 text-primary wheat-loading" />
              <span className="ml-3 text-earth-600 dark:text-earth-400">Loading...</span>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <ApperIcon name="AlertTriangle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Fields Tab */}
              {activeTab === 'fields' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                      Field Management
                    </h3>
                    <div className="text-sm text-earth-600 dark:text-earth-400">
                      {fields.length} fields total
                    </div>
                  </div>

                  {fields.length === 0 ? (
                    <div className="text-center py-8">
                      <ApperIcon name="MapPin" className="h-12 w-12 text-earth-400 mx-auto mb-4" />
                      <p className="text-earth-600 dark:text-earth-400">No fields found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {fields.map((field) => (
                        <motion.div
                          key={field.id}
                          whileHover={{ scale: 1.02 }}
                          className="border border-earth-200 dark:border-earth-700 rounded-xl p-4 sm:p-6 hover:shadow-earth-hover transition-all duration-300 cursor-pointer"
                          onClick={() => setSelectedField(selectedField === field.id ? null : field.id)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-earth-800 dark:text-earth-100 mb-1">
                                {field.name}
                              </h4>
                              <p className="text-sm text-earth-600 dark:text-earth-400">
                                {field.size} hectares • {field.soilType}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGrowthStageColor(field.currentCrop?.toLowerCase().replace(' ', '-') || 'unknown')}`}>
                              {field.currentCrop || 'No Crop'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-earth-500 dark:text-earth-400 mb-1">Planted</p>
                              <p className="text-earth-800 dark:text-earth-200">
                                {field.plantingDate ? new Date(field.plantingDate).toLocaleDateString() : 'Not planted'}
                              </p>
                            </div>
                            <div>
                              <p className="text-earth-500 dark:text-earth-400 mb-1">Expected Harvest</p>
                              <p className="text-earth-800 dark:text-earth-200">
                                {field.expectedHarvest ? new Date(field.expectedHarvest).toLocaleDateString() : 'TBD'}
                              </p>
                            </div>
                          </div>

                          {selectedField === field.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-earth-200 dark:border-earth-700"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-earth-500 dark:text-earth-400 mb-1">Coordinates</p>
                                  <p className="text-earth-800 dark:text-earth-200">
                                    {field.coordinates?.join(', ') || 'Not set'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-earth-500 dark:text-earth-400 mb-1">Growth Stage</p>
                                  <p className="text-earth-800 dark:text-earth-200 capitalize">
                                    {field.currentCrop?.toLowerCase().replace('-', ' ') || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                      Task Management
                    </h3>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 self-start sm:self-auto"
                    >
                      <ApperIcon name="Plus" className="h-4 w-4" />
                      Add Task
                    </button>
                  </div>

                  {/* Task Form Modal */}
                  <AnimatePresence>
                    {showTaskForm && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowTaskForm(false)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-white dark:bg-earth-800 rounded-xl p-6 w-full max-w-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                            Create New Task
                          </h4>
                          
                          <form onSubmit={handleTaskSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                Task Title *
                              </label>
                              <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                placeholder="Enter task title"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                  Type
                                </label>
                                <select
                                  value={newTask.type}
                                  onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value }))}
                                  className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                >
                                  <option value="planting">Planting</option>
                                  <option value="irrigation">Irrigation</option>
                                  <option value="fertilizing">Fertilizing</option>
                                  <option value="harvesting">Harvesting</option>
                                  <option value="maintenance">Maintenance</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                  Priority
                                </label>
                                <select
                                  value={newTask.priority}
                                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                                  className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                Field *
                              </label>
                              <select
                                value={newTask.fieldId}
                                onChange={(e) => setNewTask(prev => ({ ...prev, fieldId: e.target.value }))}
                                className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                              >
                                <option value="">Select a field</option>
                                {fields.map(field => (
                                  <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                  Due Date *
                                </label>
                                <input
                                  type="date"
                                  value={newTask.dueDate}
                                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                                  className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                  Assigned To *
                                </label>
                                <input
                                  type="text"
                                  value={newTask.assignedTo}
                                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                                  className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                  placeholder="Worker name"
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <button
                                type="submit"
                                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg font-medium transition-colors"
                              >
                                Create Task
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowTaskForm(false)}
                                className="flex-1 bg-earth-200 dark:bg-earth-700 text-earth-800 dark:text-earth-200 py-2 px-4 rounded-lg font-medium hover:bg-earth-300 dark:hover:bg-earth-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <ApperIcon name="CheckSquare" className="h-12 w-12 text-earth-400 mx-auto mb-4" />
                      <p className="text-earth-600 dark:text-earth-400">No tasks found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border-l-4 rounded-lg p-4 ${getPriorityColor(task.priority)} border border-earth-200 dark:border-earth-700`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-earth-800 dark:text-earth-100">
                                  {task.title}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-earth-600 dark:text-earth-400">
                                <p>📍 {getFieldById(task.fieldId).name}</p>
                                <p>👤 {task.assignedTo}</p>
                                <p>📅 {new Date(task.dueDate).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 self-start sm:self-auto">
                              {task.status === 'pending' && (
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'in-progress')}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Start
                                </button>
                              )}
                              {task.status === 'in-progress' && (
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'completed')}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                      Resource Inventory
                    </h3>
                    <div className="text-sm text-earth-600 dark:text-earth-400">
                      {resources.length} items tracked
                    </div>
                  </div>

                  {resources.length === 0 ? (
                    <div className="text-center py-8">
                      <ApperIcon name="Package" className="h-12 w-12 text-earth-400 mx-auto mb-4" />
                      <p className="text-earth-600 dark:text-earth-400">No resources found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {resources.map((resource) => {
                        const stockStatus = getStockStatus(resource.quantity, resource.minimumStock)
                        return (
                          <motion.div
                            key={resource.id}
                            whileHover={{ scale: 1.02 }}
                            className="border border-earth-200 dark:border-earth-700 rounded-xl p-4 hover:shadow-earth-hover transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-earth-800 dark:text-earth-100 mb-1">
                                  {resource.name}
                                </h4>
                                <p className="text-sm text-earth-600 dark:text-earth-400 capitalize">
                                  {resource.type}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                {stockStatus.status}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-earth-600 dark:text-earth-400">Current Stock:</span>
                                <span className="font-medium text-earth-800 dark:text-earth-200">
                                  {resource.quantity} {resource.unit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-earth-600 dark:text-earth-400">Min. Required:</span>
                                <span className="font-medium text-earth-800 dark:text-earth-200">
                                  {resource.minimumStock} {resource.unit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-earth-600 dark:text-earth-400">Supplier:</span>
                                <span className="font-medium text-earth-800 dark:text-earth-200">
                                  {resource.supplier}
                                </span>
                              </div>
                            </div>

                            {/* Stock level bar */}
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-earth-500 dark:text-earth-400 mb-1">
                                <span>Stock Level</span>
                                <span>{Math.round((resource.quantity / resource.minimumStock) * 100)}%</span>
                              </div>
                              <div className="w-full bg-earth-200 dark:bg-earth-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    stockStatus.status === 'critical' ? 'bg-red-500' :
                                    stockStatus.status === 'low' ? 'bg-orange-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((resource.quantity / resource.minimumStock) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
</div>
                  )}
                </div>
              )}
              {/* Financials Tab */}
              {activeTab === 'financials' && (
                <div>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                      Financial Tracking
                    </h3>
                    <div className="flex gap-2">
                      <select
                        value={selectedFinancialView}
                        onChange={(e) => setSelectedFinancialView(e.target.value)}
                        className="px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100 text-sm"
                      >
                        <option value="overview">Overview</option>
                        <option value="expenses">Expenses</option>
                        <option value="budgets">Budgets</option>
                        <option value="analysis">Cost Analysis</option>
                      </select>
                    </div>
                  </div>

                  {/* Financial Overview */}
                  {selectedFinancialView === 'overview' && (
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { 
                            label: "Total Expenses", 
                            value: `$${expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`,
                            icon: "TrendingDown", 
                            color: "text-red-600",
                            bg: "bg-red-50 dark:bg-red-900/20"
                          },
                          { 
                            label: "Total Budget", 
                            value: `$${budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0).toLocaleString()}`,
                            icon: "Target", 
                            color: "text-blue-600",
                            bg: "bg-blue-50 dark:bg-blue-900/20"
                          },
                          { 
                            label: "Active Budgets", 
                            value: budgets.length,
                            icon: "Calendar", 
                            color: "text-green-600",
                            bg: "bg-green-50 dark:bg-green-900/20"
                          },
                          { 
                            label: "This Month", 
                            value: `$${expenses.filter(exp => new Date(exp.date).getMonth() === new Date().getMonth()).reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`,
                            icon: "DollarSign", 
                            color: "text-primary",
                            bg: "bg-primary/10"
                          }
                        ].map((stat, index) => (
                          <div key={index} className={`${stat.bg} rounded-xl p-4 border border-earth-200 dark:border-earth-700`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-earth-600 dark:text-earth-400 text-sm mb-1">{stat.label}</p>
                                <p className="text-xl font-bold text-earth-800 dark:text-earth-100">{stat.value}</p>
                              </div>
                              <ApperIcon name={stat.icon} className={`h-8 w-8 ${stat.color}`} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expense Distribution Chart */}
                      <div className="bg-white dark:bg-earth-700 rounded-xl p-6 border border-earth-200 dark:border-earth-700">
                        <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">Expense Distribution</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="flex flex-col items-center justify-center">
                            <Chart
                              options={{
                                chart: { type: 'donut' },
                                labels: getExpenseChartData().labels,
                                colors: ['#228B22', '#32CD32', '#FFB347', '#8B4513', '#CD853F'],
                                legend: { position: 'bottom' },
                                theme: { mode: 'light' }
                              }}
                              series={getExpenseChartData().series}
                              type="donut"
                              width="100%"
                              height={300}
                            />
                          </div>
                          <div className="space-y-3">
                            {getExpenseChartData().labels.map((label, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-earth-50 dark:bg-earth-800 rounded-lg">
                                <span className="text-earth-700 dark:text-earth-300">{label}</span>
                                <span className="font-semibold text-earth-800 dark:text-earth-100">
                                  ${getExpenseChartData().series[index]?.toLocaleString() || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Budget vs Actual */}
                      <div className="bg-white dark:bg-earth-700 rounded-xl p-6 border border-earth-200 dark:border-earth-700">
                        <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">Budget vs Actual</h4>
                        <Chart
                          options={{
                            chart: { type: 'bar' },
                            xaxis: { categories: getBudgetVsActual().categories },
                            colors: ['#228B22', '#CD853F'],
                            legend: { position: 'top' }
                          }}
                          series={[
                            { name: 'Budget', data: getBudgetVsActual().budget },
                            { name: 'Actual', data: getBudgetVsActual().actual }
                          ]}
                          type="bar"
                          height={350}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expenses Management */}
                  {selectedFinancialView === 'expenses' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex gap-3">
                          <select
                            value={selectedCostField}
                            onChange={(e) => setSelectedCostField(e.target.value)}
                            className="px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100 text-sm"
                          >
                            <option value="all">All Fields</option>
                            {fields.map(field => (
                              <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                          </select>
                          <select
                            value={selectedCostCategory}
                            onChange={(e) => setSelectedCostCategory(e.target.value)}
                            className="px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100 text-sm"
                          >
                            <option value="all">All Categories</option>
                            <option value="seeds">Seeds</option>
                            <option value="fertilizers">Fertilizers</option>
                            <option value="pesticides">Pesticides</option>
                            <option value="labor">Labor</option>
                            <option value="equipment">Equipment</option>
                            <option value="fuel">Fuel</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setShowExpenseForm(true)}
                          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                        >
                          <ApperIcon name="Plus" className="h-4 w-4" />
                          Add Expense
                        </button>
                      </div>

                      {/* Expense Form Modal */}
                      <AnimatePresence>
                        {showExpenseForm && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            onClick={() => setShowExpenseForm(false)}
                          >
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-white dark:bg-earth-800 rounded-xl p-6 w-full max-w-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                                Record Expense
                              </h4>
                              
                              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                    Description *
                                  </label>
                                  <input
                                    type="text"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                    placeholder="Enter expense description"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                      Amount *
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={newExpense.amount}
                                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                                      className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                      Category
                                    </label>
                                    <select
                                      value={newExpense.category}
                                      onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                                      className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                    >
                                      <option value="seeds">Seeds</option>
                                      <option value="fertilizers">Fertilizers</option>
                                      <option value="pesticides">Pesticides</option>
                                      <option value="labor">Labor</option>
                                      <option value="equipment">Equipment</option>
                                      <option value="fuel">Fuel</option>
                                      <option value="maintenance">Maintenance</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                    Field *
                                  </label>
                                  <select
                                    value={newExpense.fieldId}
                                    onChange={(e) => setNewExpense(prev => ({ ...prev, fieldId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                  >
                                    <option value="">Select a field</option>
                                    {fields.map(field => (
                                      <option key={field.id} value={field.id}>{field.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                      Date *
                                    </label>
                                    <input
                                      type="date"
                                      value={newExpense.date}
                                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                                      className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                      Crop Type
                                    </label>
                                    <input
                                      type="text"
                                      value={newExpense.cropType}
                                      onChange={(e) => setNewExpense(prev => ({ ...prev, cropType: e.target.value }))}
                                      className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                      placeholder="Optional"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                  <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                  >
                                    Record Expense
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowExpenseForm(false)}
                                    className="flex-1 bg-earth-200 dark:bg-earth-700 text-earth-800 dark:text-earth-200 py-2 px-4 rounded-lg font-medium hover:bg-earth-300 dark:hover:bg-earth-600 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Expenses List */}
                      <div className="space-y-4">
                        {expenses
                          .filter(expense => {
                            const fieldMatch = selectedCostField === 'all' || expense.fieldId === selectedCostField
                            const categoryMatch = selectedCostCategory === 'all' || expense.category === selectedCostCategory
                            return fieldMatch && categoryMatch
                          })
                          .map((expense) => (
                            <motion.div
                              key={expense.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white dark:bg-earth-700 rounded-lg p-4 border border-earth-200 dark:border-earth-600 hover:shadow-earth-hover transition-all duration-300"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-earth-800 dark:text-earth-100">
                                      {expense.description}
                                    </h4>
                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                                      {expense.category}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-earth-600 dark:text-earth-400">
                                    <p>💰 ${expense.amount.toLocaleString()}</p>
                                    <p>📍 {getFieldById(expense.fieldId).name}</p>
                                    <p>📅 {new Date(expense.date).toLocaleDateString()}</p>
                                  </div>
                                  {expense.cropType && (
                                    <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                                      🌱 {expense.cropType}
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-2 self-start sm:self-auto">
                                  <button
                                    onClick={() => deleteExpense(expense.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Budget Management */}
                  {selectedFinancialView === 'budgets' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="text-sm text-earth-600 dark:text-earth-400">
                          {budgets.length} budgets created
                        </div>
                        <button
                          onClick={() => setShowBudgetForm(true)}
                          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                        >
                          <ApperIcon name="Plus" className="h-4 w-4" />
                          Create Budget
                        </button>
                      </div>

                      {/* Budget Form Modal */}
                      <AnimatePresence>
                        {showBudgetForm && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            onClick={() => setShowBudgetForm(false)}
                          >
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-white dark:bg-earth-800 rounded-xl p-6 w-full max-w-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                                Create Budget
                              </h4>
                              
                              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                      Category
                                    </label>
                                    <select
                                      value={newBudget.category}
                                      onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                                      className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                    >
                                      <option value="seeds">Seeds</option>
                                      <option value="fertilizers">Fertilizers</option>
                                      <option value="pesticides">Pesticides</option>
                                      <option value="labor">Labor</option>
                                      <option value="equipment">Equipment</option>
                                      <option value="fuel">Fuel</option>
                                      <option value="maintenance">Maintenance</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                      Amount *
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={newBudget.budgetAmount}
                                      onChange={(e) => setNewBudget(prev => ({ ...prev, budgetAmount: e.target.value }))}
                                      className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                    Field *
                                  </label>
                                  <select
                                    value={newBudget.fieldId}
                                    onChange={(e) => setNewBudget(prev => ({ ...prev, fieldId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                  >
                                    <option value="">Select a field</option>
                                    {fields.map(field => (
                                      <option key={field.id} value={field.id}>{field.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                      Period
                                    </label>
                                    <select
                                      value={newBudget.period}
                                      onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value }))}
                                      className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                    >
                                      <option value="monthly">Monthly</option>
                                      <option value="quarterly">Quarterly</option>
                                      <option value="yearly">Yearly</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                                      Year
                                    </label>
                                    <input
                                      type="number"
                                      value={newBudget.year}
                                      onChange={(e) => setNewBudget(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                      className="w-full px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-earth-700 dark:text-earth-100"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                  <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                  >
                                    Create Budget
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowBudgetForm(false)}
                                    className="flex-1 bg-earth-200 dark:bg-earth-700 text-earth-800 dark:text-earth-200 py-2 px-4 rounded-lg font-medium hover:bg-earth-300 dark:hover:bg-earth-600 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Budgets List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {budgets.map((budget) => {
                          const spent = expenses
                            .filter(exp => exp.fieldId === budget.fieldId && exp.category === budget.category)
                            .reduce((sum, exp) => sum + exp.amount, 0)
                          const percentage = (spent / budget.budgetAmount) * 100
                          
                          return (
                            <motion.div
                              key={budget.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white dark:bg-earth-700 rounded-lg p-4 border border-earth-200 dark:border-earth-600 hover:shadow-earth-hover transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-earth-800 dark:text-earth-100 capitalize">
                                    {budget.category}
                                  </h4>
                                  <p className="text-sm text-earth-600 dark:text-earth-400">
                                    {getFieldById(budget.fieldId).name}
                                  </p>
                                </div>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                  {budget.period}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-earth-600 dark:text-earth-400">Budget:</span>
                                  <span className="font-medium text-earth-800 dark:text-earth-200">
                                    ${budget.budgetAmount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-earth-600 dark:text-earth-400">Spent:</span>
                                  <span className="font-medium text-earth-800 dark:text-earth-200">
                                    ${spent.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-earth-600 dark:text-earth-400">Remaining:</span>
                                  <span className={`font-medium ${budget.budgetAmount - spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${(budget.budgetAmount - spent).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex justify-between text-xs text-earth-500 dark:text-earth-400 mb-1">
                                  <span>Usage</span>
                                  <span>{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-earth-200 dark:bg-earth-600 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      percentage > 100 ? 'bg-red-500' :
                                      percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cost Analysis */}
                  {selectedFinancialView === 'analysis' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cost per Field */}
                        <div className="bg-white dark:bg-earth-700 rounded-xl p-6 border border-earth-200 dark:border-earth-700">
                          <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                            Cost per Field
                          </h4>
                          <div className="space-y-3">
                            {fields.map((field) => {
                              const fieldExpenses = getExpensesByField(field.id)
                              const totalCost = fieldExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                              const costPerHectare = field.size ? (totalCost / field.size) : 0
                              
                              return (
                                <div key={field.id} className="p-3 bg-earth-50 dark:bg-earth-800 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-medium text-earth-800 dark:text-earth-100">
                                      {field.name}
                                    </h5>
                                    <span className="text-sm text-earth-600 dark:text-earth-400">
                                      {field.size} ha
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-earth-600 dark:text-earth-400">Total Cost:</span>
                                      <p className="font-semibold text-earth-800 dark:text-earth-200">
                                        ${totalCost.toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-earth-600 dark:text-earth-400">Cost/Hectare:</span>
                                      <p className="font-semibold text-earth-800 dark:text-earth-200">
                                        ${costPerHectare.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Cost by Category */}
                        <div className="bg-white dark:bg-earth-700 rounded-xl p-6 border border-earth-200 dark:border-earth-700">
                          <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                            Cost by Category
                          </h4>
                          <div className="space-y-3">
                            {['seeds', 'fertilizers', 'pesticides', 'labor', 'equipment', 'fuel', 'maintenance', 'other'].map((category) => {
                              const categoryExpenses = getExpensesByCategory(category)
                              const totalCost = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                              const percentage = expenses.length ? (totalCost / expenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100 : 0
                              
                              return (
                                <div key={category} className="p-3 bg-earth-50 dark:bg-earth-800 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-medium text-earth-800 dark:text-earth-100 capitalize">
                                      {category}
                                    </h5>
                                    <span className="text-sm text-earth-600 dark:text-earth-400">
                                      {percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-earth-800 dark:text-earth-200">
                                      ${totalCost.toLocaleString()}
                                    </span>
                                    <div className="w-20 bg-earth-200 dark:bg-earth-600 rounded-full h-2">
                                      <div
                                        className="h-2 bg-primary rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Monthly Expense Trend */}
                      <div className="bg-white dark:bg-earth-700 rounded-xl p-6 border border-earth-200 dark:border-earth-700">
                        <h4 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
                          Monthly Expense Trend
                        </h4>
                        <Chart
                          options={{
                            chart: { type: 'line' },
                            xaxis: {
                              categories: Array.from({length: 12}, (_, i) => 
                                new Date(2024, i).toLocaleDateString('en-US', { month: 'short' })
                              )
                            },
                            colors: ['#228B22'],
                            stroke: { curve: 'smooth' }
                          }}
                          series={[{
                            name: 'Monthly Expenses',
                            data: Array.from({length: 12}, (_, month) => {
                              return expenses
                                .filter(exp => new Date(exp.date).getMonth() === month)
                                .reduce((sum, exp) => sum + exp.amount, 0)
                            })
                          }]}
                          type="line"
                          height={300}
                        />
                      </div>
                    </div>
                  )}
                </div>
)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MainFeature