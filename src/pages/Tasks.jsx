import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from '../components/ApperIcon'
import { taskService } from '../services'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('dueDate')
  const [filterBy, setFilterBy] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    dueDate: '',
    field: '',
    estimatedHours: ''
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const result = await taskService.getAll()
      setTasks(result || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    try {
      const result = await taskService.create(newTask)
      setTasks(prev => [...prev, result])
      setNewTask({ title: '', description: '', type: '', priority: 'medium', status: 'pending', assignedTo: '', dueDate: '', field: '', estimatedHours: '' })
      setShowAddModal(false)
      toast.success('Task added successfully!')
    } catch (err) {
      toast.error('Failed to add task')
    }
  }

  const handleEditTask = async (e) => {
    e.preventDefault()
    try {
      const result = await taskService.update(editingTask.id, editingTask)
      setTasks(prev => prev.map(t => t.id === editingTask.id ? result : t))
      setEditingTask(null)
      toast.success('Task updated successfully!')
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(taskId)
        setTasks(prev => prev.filter(t => t.id !== taskId))
        toast.success('Task deleted successfully!')
      } catch (err) {
        toast.error('Failed to delete task')
      }
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      const result = await taskService.update(taskId, { ...task, status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? result : t))
      toast.success(`Task marked as ${newStatus}!`)
    } catch (err) {
      toast.error('Failed to update task status')
    }
  }

  const filteredTasks = tasks
    .filter(task => {
      if (filterBy === 'all') return true
      if (filterBy === 'overdue') {
        return task.status !== 'completed' && new Date(task.dueDate) < new Date()
      }
      return task.status === filterBy
    })
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate)
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return 0
    })

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'planting': return 'Sprout'
      case 'irrigation': return 'Droplets'
      case 'harvesting': return 'Wheat'
      case 'maintenance': return 'Wrench'
      case 'fertilizing': return 'Zap'
      default: return 'CheckSquare'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      default: return 'text-earth-600 bg-earth-100 dark:bg-earth-900/30 dark:text-earth-400'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'text-earth-600 bg-earth-100 dark:bg-earth-900/30 dark:text-earth-400'
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
          <p className="text-earth-600 dark:text-earth-300">Loading tasks...</p>
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
                Task Management
              </h1>
              <p className="text-earth-600 dark:text-earth-300 text-sm sm:text-base">
                Plan, track, and manage your agricultural tasks
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover"
            >
              <ApperIcon name="Plus" className="h-5 w-5 inline mr-2" />
              Add Task
            </button>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Search Tasks
                </label>
                <div className="relative">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-earth-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, description, or assignee..."
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
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tasks List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 bg-earth-100 dark:bg-earth-700 rounded-lg">
                    <ApperIcon name={getTypeIcon(task.type)} className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100">
                        {task.title}
                      </h3>
                      <div className="flex gap-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-earth-600 dark:text-earth-400 text-sm mb-3">
                      {task.description}
                    </p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="User" className="h-4 w-4 text-earth-500" />
                        <span className="text-earth-600 dark:text-earth-400">
                          {task.assignedTo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Calendar" className="h-4 w-4 text-earth-500" />
                        <span className="text-earth-600 dark:text-earth-400">
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="MapPin" className="h-4 w-4 text-earth-500" />
                        <span className="text-earth-600 dark:text-earth-400">
                          {task.field}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Clock" className="h-4 w-4 text-earth-500" />
                        <span className="text-earth-600 dark:text-earth-400">
                          {task.estimatedHours}h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                  {task.status !== 'completed' && (
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 px-3 py-1 rounded-lg hover:bg-earth-200 dark:hover:bg-earth-600 transition-colors text-sm font-medium"
                    >
                      <ApperIcon name="Edit2" className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Add New Task
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="planting">Planting</option>
                      <option value="irrigation">Irrigation</option>
                      <option value="harvesting">Harvesting</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="fertilizing">Fertilizing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Field
                    </label>
                    <input
                      type="text"
                      value={newTask.field}
                      onChange={(e) => setNewTask({...newTask, field: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
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
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Edit Task
                </h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Type
                    </label>
                    <select
                      value={editingTask.type}
                      onChange={(e) => setEditingTask({...editingTask, type: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="planting">Planting</option>
                      <option value="irrigation">Irrigation</option>
                      <option value="harvesting">Harvesting</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="fertilizing">Fertilizing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={editingTask.assignedTo}
                      onChange={(e) => setEditingTask({...editingTask, assignedTo: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editingTask.dueDate}
                      onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Field
                    </label>
                    <input
                      type="text"
                      value={editingTask.field}
                      onChange={(e) => setEditingTask({...editingTask, field: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={editingTask.estimatedHours}
                    onChange={(e) => setEditingTask({...editingTask, estimatedHours: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Task
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

export default Tasks