import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import { equipmentService } from '../services'

const EquipmentMaintenance = () => {
  const [equipment, setEquipment] = useState([])
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [view, setView] = useState('equipment') // 'equipment' or 'maintenance'
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false)
  const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [editingMaintenance, setEditingMaintenance] = useState(null)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    condition: '',
    location: '',
    fuelType: '',
    notes: '',
    maintenanceInterval: ''
  })
  const [newMaintenance, setNewMaintenance] = useState({
    equipmentId: '',
    type: '',
    description: '',
    date: '',
    cost: '',
    technician: '',
    vendor: '',
    notes: '',
    nextServiceDate: '',
    partsUsed: '',
    laborHours: ''
  })

  useEffect(() => {
    loadEquipment()
    loadMaintenanceRecords()
  }, [])

  const loadEquipment = async () => {
    setLoading(true)
    try {
      const result = await equipmentService.getEquipment()
      setEquipment(result || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  const loadMaintenanceRecords = async () => {
    try {
      const result = await equipmentService.getMaintenanceRecords()
      setMaintenanceRecords(result || [])
    } catch (err) {
      console.error('Failed to load maintenance records:', err)
      toast.error('Failed to load maintenance records')
    }
  }

  const handleAddEquipment = async (e) => {
    e.preventDefault()
    try {
      const result = await equipmentService.createEquipment(newEquipment)
      setEquipment(prev => [result, ...prev])
      setNewEquipment({
        name: '',
        type: '',
        model: '',
        manufacturer: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        currentValue: '',
        condition: '',
        location: '',
        fuelType: '',
        notes: '',
        maintenanceInterval: ''
      })
      setShowAddEquipmentModal(false)
      toast.success('Equipment added successfully!')
    } catch (err) {
      toast.error('Failed to add equipment')
    }
  }

  const handleEditEquipment = async (e) => {
    e.preventDefault()
    try {
      const result = await equipmentService.updateEquipment(editingEquipment.id, editingEquipment)
      setEquipment(prev => prev.map(eq => eq.id === editingEquipment.id ? result : eq))
      setEditingEquipment(null)
      toast.success('Equipment updated successfully!')
    } catch (err) {
      toast.error('Failed to update equipment')
    }
  }

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment and all its maintenance records?')) {
      try {
        await equipmentService.deleteEquipment(equipmentId)
        setEquipment(prev => prev.filter(eq => eq.id !== equipmentId))
        setMaintenanceRecords(prev => prev.filter(record => record.equipmentId !== equipmentId))
        toast.success('Equipment deleted successfully!')
      } catch (err) {
        toast.error('Failed to delete equipment')
      }
    }
  }

  const handleAddMaintenance = async (e) => {
    e.preventDefault()
    try {
      const maintenanceData = {
        ...newMaintenance,
        partsUsed: newMaintenance.partsUsed.split(',').map(part => part.trim()).filter(part => part)
      }
      const result = await equipmentService.createMaintenanceRecord(maintenanceData)
      setMaintenanceRecords(prev => [result, ...prev])
      
      // Update equipment if next service date is provided
      if (newMaintenance.nextServiceDate) {
        const updatedEquipment = equipment.map(eq => 
          eq.id === newMaintenance.equipmentId 
            ? { ...eq, lastMaintenanceDate: newMaintenance.date, nextMaintenanceDate: newMaintenance.nextServiceDate }
            : eq
        )
        setEquipment(updatedEquipment)
      }
      
      setNewMaintenance({
        equipmentId: '',
        type: '',
        description: '',
        date: '',
        cost: '',
        technician: '',
        vendor: '',
        notes: '',
        nextServiceDate: '',
        partsUsed: '',
        laborHours: ''
      })
      setShowAddMaintenanceModal(false)
      toast.success('Maintenance record added successfully!')
    } catch (err) {
      toast.error('Failed to add maintenance record')
    }
  }

  const handleEditMaintenance = async (e) => {
    e.preventDefault()
    try {
      const maintenanceData = {
        ...editingMaintenance,
        partsUsed: typeof editingMaintenance.partsUsed === 'string' 
          ? editingMaintenance.partsUsed.split(',').map(part => part.trim()).filter(part => part)
          : editingMaintenance.partsUsed
      }
      const result = await equipmentService.updateMaintenanceRecord(editingMaintenance.id, maintenanceData)
      setMaintenanceRecords(prev => prev.map(record => record.id === editingMaintenance.id ? result : record))
      setEditingMaintenance(null)
      toast.success('Maintenance record updated successfully!')
    } catch (err) {
      toast.error('Failed to update maintenance record')
    }
  }

  const handleDeleteMaintenance = async (maintenanceId) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await equipmentService.deleteMaintenanceRecord(maintenanceId)
        setMaintenanceRecords(prev => prev.filter(record => record.id !== maintenanceId))
        toast.success('Maintenance record deleted successfully!')
      } catch (err) {
        toast.error('Failed to delete maintenance record')
      }
    }
  }

  const filteredEquipment = equipment
    .filter(eq => {
      if (filterBy === 'all') return true
      if (filterBy === 'overdue') {
        if (!eq.nextMaintenanceDate) return false
        return new Date(eq.nextMaintenanceDate) < new Date()
      }
      if (filterBy === 'upcoming') {
        if (!eq.nextMaintenanceDate) return false
        const daysUntil = Math.ceil((new Date(eq.nextMaintenanceDate) - new Date()) / (24 * 60 * 60 * 1000))
        return daysUntil >= 0 && daysUntil <= 30
      }
      return eq.type.toLowerCase() === filterBy.toLowerCase()
    })
    .filter(eq => 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'type') return a.type.localeCompare(b.type)
      if (sortBy === 'manufacturer') return a.manufacturer.localeCompare(b.manufacturer)
      if (sortBy === 'purchaseDate') return new Date(b.purchaseDate) - new Date(a.purchaseDate)
      if (sortBy === 'nextMaintenance') {
        if (!a.nextMaintenanceDate && !b.nextMaintenanceDate) return 0
        if (!a.nextMaintenanceDate) return 1
        if (!b.nextMaintenanceDate) return -1
        return new Date(a.nextMaintenanceDate) - new Date(b.nextMaintenanceDate)
      }
      return 0
    })

  const filteredMaintenanceRecords = maintenanceRecords
    .filter(record => {
      if (selectedEquipment) return record.equipmentId === selectedEquipment.id
      return true
    })
    .filter(record =>
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'cost') return parseFloat(b.cost) - parseFloat(a.cost)
      if (sortBy === 'type') return a.type.localeCompare(b.type)
      return 0
    })

  const getMaintenanceStatus = (nextMaintenanceDate) => {
    if (!nextMaintenanceDate) return { status: 'none', text: 'No Schedule', color: 'text-gray-500' }
    
    const today = new Date()
    const maintenanceDate = new Date(nextMaintenanceDate)
    const daysUntil = Math.ceil((maintenanceDate - today) / (24 * 60 * 60 * 1000))
    
    if (daysUntil < 0) {
      return { status: 'overdue', text: `${Math.abs(daysUntil)} days overdue`, color: 'text-red-600' }
    } else if (daysUntil <= 7) {
      return { status: 'due', text: `Due in ${daysUntil} days`, color: 'text-orange-600' }
    } else if (daysUntil <= 30) {
      return { status: 'upcoming', text: `Due in ${daysUntil} days`, color: 'text-yellow-600' }
    } else {
      return { status: 'scheduled', text: `Due in ${daysUntil} days`, color: 'text-green-600' }
    }
  }

  const getEquipmentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'tractor': return 'Truck'
      case 'combine harvester': return 'Combine'
      case 'baler': return 'Package'
      case 'plow': return 'Shovel'
      case 'seeder': return 'Sprout'
      case 'sprayer': return 'Droplets'
      default: return 'Settings'
    }
  }

  const getMaintenanceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'scheduled': return 'Calendar'
      case 'repair': return 'Wrench'
      case 'inspection': return 'Search'
      case 'upgrade': return 'ArrowUp'
      default: return 'Settings'
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
          <p className="text-earth-600 dark:text-earth-300">Loading equipment data...</p>
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
                Equipment Maintenance
              </h1>
              <p className="text-earth-600 dark:text-earth-300 text-sm sm:text-base">
                Track equipment, schedule maintenance, and manage service records
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddEquipmentModal(true)}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover"
              >
                <ApperIcon name="Plus" className="h-5 w-5 inline mr-2" />
                Add Equipment
              </button>
              <button
                onClick={() => setShowAddMaintenanceModal(true)}
                className="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover"
              >
                <ApperIcon name="Wrench" className="h-5 w-5 inline mr-2" />
                Add Maintenance
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex bg-earth-100 dark:bg-earth-700 rounded-lg p-1">
                <button
                  onClick={() => setView('equipment')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    view === 'equipment'
                      ? 'bg-primary text-white'
                      : 'text-earth-600 dark:text-earth-300 hover:text-earth-800 dark:hover:text-earth-100'
                  }`}
                >
                  <ApperIcon name="Settings" className="h-4 w-4 inline mr-2" />
                  Equipment
                </button>
                <button
                  onClick={() => setView('maintenance')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    view === 'maintenance'
                      ? 'bg-primary text-white'
                      : 'text-earth-600 dark:text-earth-300 hover:text-earth-800 dark:hover:text-earth-100'
                  }`}
                >
                  <ApperIcon name="Wrench" className="h-4 w-4 inline mr-2" />
                  Maintenance
                </button>
              </div>

              {view === 'maintenance' && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-earth-600 dark:text-earth-300">Filter by equipment:</span>
                  <select
                    value={selectedEquipment?.id || ''}
                    onChange={(e) => {
                      const eq = equipment.find(eq => eq.id === e.target.value)
                      setSelectedEquipment(eq || null)
                    }}
                    className="px-3 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    <option value="">All Equipment</option>
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
              Search & Filter
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-earth-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={view === 'equipment' ? "Search equipment..." : "Search maintenance records..."}
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
                  {view === 'equipment' ? (
                    <>
                      <option value="name">Name</option>
                      <option value="type">Type</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="purchaseDate">Purchase Date</option>
                      <option value="nextMaintenance">Next Maintenance</option>
                    </>
                  ) : (
                    <>
                      <option value="date">Date</option>
                      <option value="cost">Cost</option>
                      <option value="type">Type</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Filter
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {view === 'equipment' ? (
                    <>
                      <option value="all">All Equipment</option>
                      <option value="overdue">Overdue Maintenance</option>
                      <option value="upcoming">Upcoming Maintenance</option>
                      <option value="tractor">Tractors</option>
                      <option value="combine harvester">Combine Harvesters</option>
                      <option value="baler">Balers</option>
                    </>
                  ) : (
                    <>
                      <option value="all">All Types</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="repair">Repairs</option>
                      <option value="inspection">Inspections</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Equipment List */}
        {view === 'equipment' && (
          <motion.div variants={itemVariants} className="space-y-4">
            {filteredEquipment.map((eq, index) => {
              const maintenanceStatus = getMaintenanceStatus(eq.nextMaintenanceDate)
              return (
                <motion.div
                  key={eq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-earth-100 dark:bg-earth-700 rounded-lg">
                        <ApperIcon name={getEquipmentIcon(eq.type)} className="h-8 w-8 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                            {eq.name}
                          </h3>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-lg font-bold text-primary">
                              ${eq.currentValue?.toLocaleString()}
                            </span>
                            <span className={`text-sm font-medium ${maintenanceStatus.color}`}>
                              {maintenanceStatus.text}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-earth-600 dark:text-earth-400 text-sm mb-3">
                          {eq.manufacturer} {eq.model} | Serial: {eq.serialNumber}
                        </p>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Tag" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {eq.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ApperIcon name="MapPin" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {eq.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Activity" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {eq.operatingHours} hrs
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Calendar" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {new Date(eq.purchaseDate).getFullYear()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEquipment(eq)}
                        className="bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 px-4 py-2 rounded-lg hover:bg-earth-200 dark:hover:bg-earth-600 transition-colors text-sm font-medium"
                      >
                        <ApperIcon name="Edit2" className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(eq.id)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Maintenance Records List */}
        {view === 'maintenance' && (
          <motion.div variants={itemVariants} className="space-y-4">
            {filteredMaintenanceRecords.map((record, index) => {
              const equipment_item = equipment.find(eq => eq.id === record.equipmentId)
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-earth-100 dark:bg-earth-700 rounded-lg">
                        <ApperIcon name={getMaintenanceIcon(record.type)} className="h-8 w-8 text-secondary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                            {record.description}
                          </h3>
                          <span className="text-lg font-bold text-red-600 ml-4">
                            ${parseFloat(record.cost).toFixed(2)}
                          </span>
                        </div>
                        
                        <p className="text-earth-600 dark:text-earth-400 text-sm mb-3">
                          {equipment_item?.name} | {record.technician} | {record.vendor}
                        </p>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Tag" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400 capitalize">
                              {record.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Calendar" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Clock" className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-600 dark:text-earth-400">
                              {record.laborHours} hrs
                            </span>
                          </div>
                          {record.nextServiceDate && (
                            <div className="flex items-center gap-2">
                              <ApperIcon name="CalendarDays" className="h-4 w-4 text-earth-500" />
                              <span className="text-earth-600 dark:text-earth-400">
                                Next: {new Date(record.nextServiceDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMaintenance({
                          ...record,
                          partsUsed: Array.isArray(record.partsUsed) ? record.partsUsed.join(', ') : record.partsUsed
                        })}
                        className="bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 px-4 py-2 rounded-lg hover:bg-earth-200 dark:hover:bg-earth-600 transition-colors text-sm font-medium"
                      >
                        <ApperIcon name="Edit2" className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMaintenance(record.id)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Add Equipment Modal */}
        {showAddEquipmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Add New Equipment
                </h3>
                <button
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddEquipment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Equipment Name
                    </label>
                    <input
                      type="text"
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newEquipment.type}
                      onChange={(e) => setNewEquipment({...newEquipment, type: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Tractor">Tractor</option>
                      <option value="Combine Harvester">Combine Harvester</option>
                      <option value="Baler">Baler</option>
                      <option value="Plow">Plow</option>
                      <option value="Seeder">Seeder</option>
                      <option value="Sprayer">Sprayer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={newEquipment.manufacturer}
                      onChange={(e) => setNewEquipment({...newEquipment, manufacturer: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={newEquipment.model}
                      onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={newEquipment.serialNumber}
                      onChange={(e) => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={newEquipment.purchaseDate}
                      onChange={(e) => setNewEquipment({...newEquipment, purchaseDate: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEquipment.purchasePrice}
                      onChange={(e) => setNewEquipment({...newEquipment, purchasePrice: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Current Value ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEquipment.currentValue}
                      onChange={(e) => setNewEquipment({...newEquipment, currentValue: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Condition
                    </label>
                    <select
                      value={newEquipment.condition}
                      onChange={(e) => setNewEquipment({...newEquipment, condition: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select condition</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newEquipment.location}
                      onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={newEquipment.fuelType}
                      onChange={(e) => setNewEquipment({...newEquipment, fuelType: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select fuel type</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Electric">Electric</option>
                      <option value="PTO">PTO Driven</option>
                      <option value="Hydraulic">Hydraulic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Maintenance Interval (days)
                  </label>
                  <input
                    type="number"
                    value={newEquipment.maintenanceInterval}
                    onChange={(e) => setNewEquipment({...newEquipment, maintenanceInterval: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 90 for quarterly maintenance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newEquipment.notes}
                    onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Additional notes about this equipment..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddEquipmentModal(false)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Equipment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Maintenance Modal */}
        {showAddMaintenanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Add Maintenance Record
                </h3>
                <button
                  onClick={() => setShowAddMaintenanceModal(false)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddMaintenance} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Equipment
                    </label>
                    <select
                      value={newMaintenance.equipmentId}
                      onChange={(e) => setNewMaintenance({...newMaintenance, equipmentId: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select equipment</option>
                      {equipment.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newMaintenance.type}
                      onChange={(e) => setNewMaintenance({...newMaintenance, type: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Scheduled">Scheduled Maintenance</option>
                      <option value="Repair">Repair</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Upgrade">Upgrade</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newMaintenance.date}
                      onChange={(e) => setNewMaintenance({...newMaintenance, date: e.target.value})}
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
                      value={newMaintenance.cost}
                      onChange={(e) => setNewMaintenance({...newMaintenance, cost: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Labor Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={newMaintenance.laborHours}
                      onChange={(e) => setNewMaintenance({...newMaintenance, laborHours: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Technician
                    </label>
                    <input
                      type="text"
                      value={newMaintenance.technician}
                      onChange={(e) => setNewMaintenance({...newMaintenance, technician: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Vendor/Service Provider
                    </label>
                    <input
                      type="text"
                      value={newMaintenance.vendor}
                      onChange={(e) => setNewMaintenance({...newMaintenance, vendor: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Parts Used (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newMaintenance.partsUsed}
                    onChange={(e) => setNewMaintenance({...newMaintenance, partsUsed: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Oil filter, Hydraulic hose, Engine oil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Next Service Date (optional)
                  </label>
                  <input
                    type="date"
                    value={newMaintenance.nextServiceDate}
                    onChange={(e) => setNewMaintenance({...newMaintenance, nextServiceDate: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newMaintenance.notes}
                    onChange={(e) => setNewMaintenance({...newMaintenance, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Additional notes about this maintenance..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMaintenanceModal(false)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Maintenance
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Equipment Modal */}
        {editingEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Edit Equipment
                </h3>
                <button
                  onClick={() => setEditingEquipment(null)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditEquipment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Equipment Name
                    </label>
                    <input
                      type="text"
                      value={editingEquipment.name}
                      onChange={(e) => setEditingEquipment({...editingEquipment, name: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Type
                    </label>
                    <select
                      value={editingEquipment.type}
                      onChange={(e) => setEditingEquipment({...editingEquipment, type: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Tractor">Tractor</option>
                      <option value="Combine Harvester">Combine Harvester</option>
                      <option value="Baler">Baler</option>
                      <option value="Plow">Plow</option>
                      <option value="Seeder">Seeder</option>
                      <option value="Sprayer">Sprayer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={editingEquipment.manufacturer}
                      onChange={(e) => setEditingEquipment({...editingEquipment, manufacturer: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={editingEquipment.model}
                      onChange={(e) => setEditingEquipment({...editingEquipment, model: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Current Value ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingEquipment.currentValue}
                      onChange={(e) => setEditingEquipment({...editingEquipment, currentValue: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Condition
                    </label>
                    <select
                      value={editingEquipment.condition}
                      onChange={(e) => setEditingEquipment({...editingEquipment, condition: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select condition</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingEquipment.location}
                      onChange={(e) => setEditingEquipment({...editingEquipment, location: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Operating Hours
                    </label>
                    <input
                      type="number"
                      value={editingEquipment.operatingHours}
                      onChange={(e) => setEditingEquipment({...editingEquipment, operatingHours: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editingEquipment.notes}
                    onChange={(e) => setEditingEquipment({...editingEquipment, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Additional notes about this equipment..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingEquipment(null)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Equipment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Maintenance Modal */}
        {editingMaintenance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100">
                  Edit Maintenance Record
                </h3>
                <button
                  onClick={() => setEditingMaintenance(null)}
                  className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditMaintenance} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Equipment
                    </label>
                    <select
                      value={editingMaintenance.equipmentId}
                      onChange={(e) => setEditingMaintenance({...editingMaintenance, equipmentId: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select equipment</option>
                      {equipment.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Type
                    </label>
                    <select
                      value={editingMaintenance.type}
                      onChange={(e) => setEditingMaintenance({...editingMaintenance, type: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Scheduled">Scheduled Maintenance</option>
                      <option value="Repair">Repair</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Upgrade">Upgrade</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingMaintenance.description}
                    onChange={(e) => setEditingMaintenance({...editingMaintenance, description: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editingMaintenance.date}
                      onChange={(e) => setEditingMaintenance({...editingMaintenance, date: e.target.value})}
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
                      value={editingMaintenance.cost}
                      onChange={(e) => setEditingMaintenance({...editingMaintenance, cost: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Labor Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingMaintenance.laborHours}
                      onChange={(e) => setEditingMaintenance({...editingMaintenance, laborHours: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Technician
                    </label>
                    <input
                      type="text"
                      value={editingMaintenance.technician}
                      onChange={(e) => setEditingMaintenance({...editingMaintenance, technician: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                      Vendor/Service Provider
                    </label>
                    <input
                      type="text"
                      value={editingMaintenance.vendor}
                      onChange={(e) => setEditingMaintenance({...editingMaintenance, vendor: e.target.value})}
                      className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Parts Used (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingMaintenance.partsUsed}
                    onChange={(e) => setEditingMaintenance({...editingMaintenance, partsUsed: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Oil filter, Hydraulic hose, Engine oil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Next Service Date (optional)
                  </label>
                  <input
                    type="date"
                    value={editingMaintenance.nextServiceDate}
                    onChange={(e) => setEditingMaintenance({...editingMaintenance, nextServiceDate: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editingMaintenance.notes}
                    onChange={(e) => setEditingMaintenance({...editingMaintenance, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Additional notes about this maintenance..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingMaintenance(null)}
                    className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-600 text-earth-700 dark:text-earth-300 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Maintenance
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

export default EquipmentMaintenance