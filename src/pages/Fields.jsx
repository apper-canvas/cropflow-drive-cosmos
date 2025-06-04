import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import { fieldService } from '../services'

const Fields = () => {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [newField, setNewField] = useState({
    name: '',
    size: '',
    location: '',
    soilType: '',
    currentCrop: '',
    status: 'active'
  })

  useEffect(() => {
    loadFields()
  }, [])

  const loadFields = async () => {
    setLoading(true)
    try {
      const result = await fieldService.getAll()
      setFields(result || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load fields')
    } finally {
      setLoading(false)
    }
  }

  const handleAddField = async (e) => {
    e.preventDefault()
    try {
      const result = await fieldService.create(newField)
      setFields(prev => [...prev, result])
      setNewField({ name: '', size: '', location: '', soilType: '', currentCrop: '', status: 'active' })
      setShowAddModal(false)
      toast.success('Field added successfully!')
    } catch (err) {
      toast.error('Failed to add field')
    }
  }

  const handleEditField = async (e) => {
    e.preventDefault()
    try {
      const result = await fieldService.update(editingField.id, editingField)
      setFields(prev => prev.map(f => f.id === editingField.id ? result : f))
      setEditingField(null)
      toast.success('Field updated successfully!')
    } catch (err) {
      toast.error('Failed to update field')
    }
  }

  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await fieldService.delete(fieldId)
        setFields(prev => prev.filter(f => f.id !== fieldId))
        toast.success('Field deleted successfully!')
      } catch (err) {
        toast.error('Failed to delete field')
      }
    }
  }

  const filteredFields = fields
    .filter(field => {
      if (filterBy === 'all') return true
      return field.status === filterBy
    })
    .filter(field => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.currentCrop.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'size') return parseFloat(b.size) - parseFloat(a.size)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })

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
          <p className="text-earth-600 dark:text-earth-300">Loading fields...</p>
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
                Field Management
              </h1>
              <p className="text-earth-600 dark:text-earth-300 text-sm sm:text-base">
                Manage and monitor your agricultural fields
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover"
            >
              <ApperIcon name="Plus" className="h-5 w-5 inline mr-2" />
              Add Field
            </button>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Search Fields
                </label>
                <div className="relative">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-earth-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, location, or crop..."
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
                  <option value="size">Size</option>
                  <option value="status">Status</option>
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
                  <option value="all">All Fields</option>
                  <option value="active">Active</option>
                  <option value="fallow">Fallow</option>
                  <option value="preparing">Preparing</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fields Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-1">
                    {field.name}
                  </h3>
                  <p className="text-earth-600 dark:text-earth-400 text-sm">
                    {field.location}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  field.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  field.status === 'fallow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {field.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Maximize" className="h-4 w-4 text-earth-500" />
                  <span className="text-sm text-earth-600 dark:text-earth-400">
                    {field.size} hectares
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ApperIcon name="MapPin" className="h-4 w-4 text-earth-500" />
                  <span className="text-sm text-earth-600 dark:text-earth-400">
                    {field.soilType} soil
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ApperIcon name="Wheat" className="h-4 w-4 text-earth-500" />
                  <span className="text-sm text-earth-600 dark:text-earth-400">
                    {field.currentCrop || 'No crop planted'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingField(field)}
                  className="flex-1 bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 px-4 py-2 rounded-lg hover:bg-earth-200 dark:hover:bg-earth-600 transition-colors text-sm font-medium"
                >
                  <ApperIcon name="Edit2" className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteField(field.id)}
                  className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Field Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Add New Field
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddField} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={newField.name}
                    onChange={(e) => setNewField({...newField, name: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Size (hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newField.size}
                    onChange={(e) => setNewField({...newField, size: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newField.location}
                    onChange={(e) => setNewField({...newField, location: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Soil Type
                  </label>
                  <select
                    value={newField.soilType}
                    onChange={(e) => setNewField({...newField, soilType: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select soil type</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Loam">Loam</option>
                    <option value="Silt">Silt</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Current Crop
                  </label>
                  <input
                    type="text"
                    value={newField.currentCrop}
                    onChange={(e) => setNewField({...newField, currentCrop: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Status
                  </label>
                  <select
                    value={newField.status}
                    onChange={(e) => setNewField({...newField, status: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="fallow">Fallow</option>
                    <option value="preparing">Preparing</option>
                  </select>
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
                    Add Field
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Field Modal */}
        {editingField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Edit Field
                </h3>
                <button
                  onClick={() => setEditingField(null)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditField} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={editingField.name}
                    onChange={(e) => setEditingField({...editingField, name: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Size (hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingField.size}
                    onChange={(e) => setEditingField({...editingField, size: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingField.location}
                    onChange={(e) => setEditingField({...editingField, location: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Soil Type
                  </label>
                  <select
                    value={editingField.soilType}
                    onChange={(e) => setEditingField({...editingField, soilType: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select soil type</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Loam">Loam</option>
                    <option value="Silt">Silt</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Current Crop
                  </label>
                  <input
                    type="text"
                    value={editingField.currentCrop}
                    onChange={(e) => setEditingField({...editingField, currentCrop: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editingField.status}
                    onChange={(e) => setEditingField({...editingField, status: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="fallow">Fallow</option>
                    <option value="preparing">Preparing</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Field
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

export default Fields