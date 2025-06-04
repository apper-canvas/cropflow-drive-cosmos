import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import { resourceService } from '../services'

const Resources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    quantity: '',
    unit: '',
    location: '',
    supplier: '',
    cost: '',
    status: 'available'
  })

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    setLoading(true)
    try {
      const result = await resourceService.getAll()
      setResources(result || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    try {
      const result = await resourceService.create(newResource)
      setResources(prev => [...prev, result])
      setNewResource({ name: '', type: '', quantity: '', unit: '', location: '', supplier: '', cost: '', status: 'available' })
      setShowAddModal(false)
      toast.success('Resource added successfully!')
    } catch (err) {
      toast.error('Failed to add resource')
    }
  }

  const handleEditResource = async (e) => {
    e.preventDefault()
    try {
      const result = await resourceService.update(editingResource.id, editingResource)
      setResources(prev => prev.map(r => r.id === editingResource.id ? result : r))
      setEditingResource(null)
      toast.success('Resource updated successfully!')
    } catch (err) {
      toast.error('Failed to update resource')
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.delete(resourceId)
        setResources(prev => prev.filter(r => r.id !== resourceId))
        toast.success('Resource deleted successfully!')
      } catch (err) {
        toast.error('Failed to delete resource')
      }
    }
  }

  const filteredResources = resources
    .filter(resource => {
      if (filterBy === 'all') return true
      if (filterBy === 'low_stock') return resource.quantity <= 10
      return resource.type === filterBy
    })
    .filter(resource => 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'quantity') return parseFloat(b.quantity) - parseFloat(a.quantity)
      if (sortBy === 'type') return a.type.localeCompare(b.type)
      return 0
    })

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'seeds': return 'Sprout'
      case 'fertilizer': return 'Droplets'
      case 'pesticide': return 'Bug'
      case 'equipment': return 'Wrench'
      case 'fuel': return 'Fuel'
      default: return 'Package'
    }
  }

  const getStatusColor = (resource) => {
    if (resource.quantity <= 5) return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    if (resource.quantity <= 10) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
    return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
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
          <p className="text-earth-600 dark:text-earth-300">Loading resources...</p>
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
                Resource Inventory
              </h1>
              <p className="text-earth-600 dark:text-earth-300 text-sm sm:text-base">
                Track and manage your agricultural resources and supplies
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover"
            >
              <ApperIcon name="Plus" className="h-5 w-5 inline mr-2" />
              Add Resource
            </button>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Search Resources
                </label>
                <div className="relative">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-earth-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, type, or supplier..."
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
                  <option value="name">Name</option>
                  <option value="quantity">Quantity</option>
                  <option value="type">Type</option>
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
                  <option value="all">All Resources</option>
                  <option value="seeds">Seeds</option>
                  <option value="fertilizer">Fertilizer</option>
                  <option value="pesticide">Pesticide</option>
                  <option value="equipment">Equipment</option>
                  <option value="fuel">Fuel</option>
                  <option value="low_stock">Low Stock</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-earth-100 dark:bg-earth-700 rounded-lg">
                    <ApperIcon name={getTypeIcon(resource.type)} className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-1">
                      {resource.name}
                    </h3>
                    <p className="text-earth-600 dark:text-earth-400 text-sm capitalize">
                      {resource.type}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource)}`}>
                  {resource.quantity <= 5 ? 'Critical' : resource.quantity <= 10 ? 'Low' : 'Good'}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-earth-600 dark:text-earth-400">Quantity:</span>
                  <span className="text-sm font-medium text-earth-800 dark:text-earth-100">
                    {resource.quantity} {resource.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-earth-600 dark:text-earth-400">Location:</span>
                  <span className="text-sm font-medium text-earth-800 dark:text-earth-100">
                    {resource.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-earth-600 dark:text-earth-400">Supplier:</span>
                  <span className="text-sm font-medium text-earth-800 dark:text-earth-100">
                    {resource.supplier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-earth-600 dark:text-earth-400">Cost:</span>
                  <span className="text-sm font-medium text-earth-800 dark:text-earth-100">
                    ${resource.cost}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingResource(resource)}
                  className="flex-1 bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 px-4 py-2 rounded-lg hover:bg-earth-200 dark:hover:bg-earth-600 transition-colors text-sm font-medium"
                >
                  <ApperIcon name="Edit2" className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteResource(resource.id)}
                  className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Resource Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Add New Resource
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddResource} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    value={newResource.name}
                    onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Type
                  </label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="seeds">Seeds</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="pesticide">Pesticide</option>
                    <option value="equipment">Equipment</option>
                    <option value="fuel">Fuel</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={newResource.quantity}
                      onChange={(e) => setNewResource({...newResource, quantity: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={newResource.unit}
                      onChange={(e) => setNewResource({...newResource, unit: e.target.value})}
                      placeholder="kg, liters, bags..."
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newResource.location}
                    onChange={(e) => setNewResource({...newResource, location: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={newResource.supplier}
                    onChange={(e) => setNewResource({...newResource, supplier: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newResource.cost}
                    onChange={(e) => setNewResource({...newResource, cost: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
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
                    Add Resource
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Resource Modal */}
        {editingResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Edit Resource
                </h3>
                <button
                  onClick={() => setEditingResource(null)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditResource} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    value={editingResource.name}
                    onChange={(e) => setEditingResource({...editingResource, name: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Type
                  </label>
                  <select
                    value={editingResource.type}
                    onChange={(e) => setEditingResource({...editingResource, type: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="seeds">Seeds</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="pesticide">Pesticide</option>
                    <option value="equipment">Equipment</option>
                    <option value="fuel">Fuel</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={editingResource.quantity}
                      onChange={(e) => setEditingResource({...editingResource, quantity: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={editingResource.unit}
                      onChange={(e) => setEditingResource({...editingResource, unit: e.target.value})}
                      placeholder="kg, liters, bags..."
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingResource.location}
                    onChange={(e) => setEditingResource({...editingResource, location: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={editingResource.supplier}
                    onChange={(e) => setEditingResource({...editingResource, supplier: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingResource.cost}
                    onChange={(e) => setEditingResource({...editingResource, cost: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingResource(null)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Resource
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

export default Resources