const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data for equipment
let equipment = [
  {
    id: '1',
    name: 'John Deere 7230R Tractor',
    type: 'Tractor',
    model: '7230R',
    manufacturer: 'John Deere',
    serialNumber: 'JD7230R-001',
    purchaseDate: '2019-03-15',
    purchasePrice: 285000,
    currentValue: 220000,
    condition: 'Good',
    location: 'Main Barn',
    operatingHours: 1250,
    fuelType: 'Diesel',
    notes: 'Primary field work tractor, well maintained',
    status: 'Active',
    lastMaintenanceDate: '2024-02-15',
    nextMaintenanceDate: '2024-05-15',
    maintenanceInterval: 90 // days
  },
  {
    id: '2',
    name: 'Case IH Axial-Flow 8250',
    type: 'Combine Harvester',
    model: 'Axial-Flow 8250',
    manufacturer: 'Case IH',
    serialNumber: 'CIH8250-002',
    purchaseDate: '2020-08-22',
    purchasePrice: 450000,
    currentValue: 380000,
    condition: 'Excellent',
    location: 'Equipment Shed',
    operatingHours: 320,
    fuelType: 'Diesel',
    notes: 'Used only during harvest season',
    status: 'Active',
    lastMaintenanceDate: '2024-01-20',
    nextMaintenanceDate: '2024-04-20',
    maintenanceInterval: 90
  },
  {
    id: '3',
    name: 'Kubota M7-172 Tractor',
    type: 'Tractor',
    model: 'M7-172',
    manufacturer: 'Kubota',
    serialNumber: 'KUB172-003',
    purchaseDate: '2021-05-10',
    purchasePrice: 165000,
    currentValue: 145000,
    condition: 'Good',
    location: 'Field Station',
    operatingHours: 890,
    fuelType: 'Diesel',
    notes: 'Secondary tractor for lighter field work',
    status: 'Active',
    lastMaintenanceDate: '2024-03-01',
    nextMaintenanceDate: '2024-06-01',
    maintenanceInterval: 90
  },
  {
    id: '4',
    name: 'New Holland BR7070 Baler',
    type: 'Baler',
    model: 'BR7070',
    manufacturer: 'New Holland',
    serialNumber: 'NH7070-004',
    purchaseDate: '2018-06-30',
    purchasePrice: 95000,
    currentValue: 65000,
    condition: 'Fair',
    location: 'Main Barn',
    operatingHours: 560,
    fuelType: 'PTO',
    notes: 'Needs hydraulic system service',
    status: 'Active',
    lastMaintenanceDate: '2024-01-10',
    nextMaintenanceDate: '2024-04-10',
    maintenanceInterval: 90
  },
  {
    id: '5',
    name: 'Fendt 724 Vario Tractor',
    type: 'Tractor',
    model: '724 Vario',
    manufacturer: 'Fendt',
    serialNumber: 'FEN724-005',
    purchaseDate: '2022-04-15',
    purchasePrice: 295000,
    currentValue: 275000,
    condition: 'Excellent',
    location: 'New Equipment Barn',
    operatingHours: 450,
    fuelType: 'Diesel',
    notes: 'Latest addition, GPS-guided',
    status: 'Active',
    lastMaintenanceDate: '2024-03-10',
    nextMaintenanceDate: '2024-06-10',
    maintenanceInterval: 90
  }
]

// Mock data for maintenance records
let maintenanceRecords = [
  {
    id: '1',
    equipmentId: '1',
    type: 'Scheduled',
    description: 'Oil change and filter replacement',
    date: '2024-02-15',
    cost: 450.00,
    technician: 'Mike Johnson',
    vendor: 'John Deere Service',
    notes: 'All filters replaced, oil analysis normal',
    nextServiceDate: '2024-05-15',
    status: 'Completed',
    partsUsed: ['Oil filter', 'Hydraulic filter', 'Engine oil'],
    laborHours: 3.5
  },
  {
    id: '2',
    equipmentId: '2',
    type: 'Scheduled',
    description: 'Pre-season inspection and service',
    date: '2024-01-20',
    cost: 1250.00,
    technician: 'Sarah Williams',
    vendor: 'Case IH Service Center',
    notes: 'Full inspection completed, all systems operational',
    nextServiceDate: '2024-04-20',
    status: 'Completed',
    partsUsed: ['Air filter', 'Hydraulic fluid', 'Greasing supplies'],
    laborHours: 6.0
  },
  {
    id: '3',
    equipmentId: '3',
    type: 'Repair',
    description: 'Hydraulic hose replacement',
    date: '2024-03-01',
    cost: 380.50,
    technician: 'Tom Anderson',
    vendor: 'Local Hydraulic Shop',
    notes: 'Two hydraulic hoses replaced due to wear',
    nextServiceDate: '2024-06-01',
    status: 'Completed',
    partsUsed: ['Hydraulic hose x2', 'Hydraulic fittings'],
    laborHours: 2.5
  },
  {
    id: '4',
    equipmentId: '4',
    type: 'Scheduled',
    description: 'Annual maintenance service',
    date: '2024-01-10',
    cost: 680.75,
    technician: 'Bob Martinez',
    vendor: 'New Holland Service',
    notes: 'Comprehensive service, some wear noted in pickup system',
    nextServiceDate: '2024-04-10',
    status: 'Completed',
    partsUsed: ['Belts', 'Grease', 'Hydraulic oil'],
    laborHours: 4.0
  },
  {
    id: '5',
    equipmentId: '5',
    type: 'Scheduled',
    description: 'First service - break-in maintenance',
    date: '2024-03-10',
    cost: 320.00,
    technician: 'Lisa Chen',
    vendor: 'Fendt Dealer Service',
    notes: 'Break-in service completed, all warranty requirements met',
    nextServiceDate: '2024-06-10',
    status: 'Completed',
    partsUsed: ['Oil filter', 'Engine oil'],
    laborHours: 2.0
  },
  {
    id: '6',
    equipmentId: '1',
    type: 'Repair',
    description: 'Air conditioning repair',
    date: '2024-03-20',
    cost: 850.00,
    technician: 'Mike Johnson',
    vendor: 'Climate Control Specialists',
    notes: 'Compressor replaced, system recharged',
    nextServiceDate: null,
    status: 'Completed',
    partsUsed: ['A/C compressor', 'Refrigerant', 'O-rings'],
    laborHours: 5.5
  }
]

const equipmentService = {
  // Equipment operations
  async getEquipment() {
    await delay(300)
    return [...equipment]
  },

  async getEquipmentById(id) {
    await delay(200)
    const item = equipment.find(eq => eq.id === id)
    if (!item) throw new Error('Equipment not found')
    return { ...item }
  },

  async createEquipment(equipmentData) {
    await delay(400)
    const newEquipment = {
      ...equipmentData,
      id: Date.now().toString(),
      status: 'Active',
      operatingHours: 0,
      lastMaintenanceDate: null,
      nextMaintenanceDate: null
    }
    equipment = [newEquipment, ...equipment]
    return { ...newEquipment }
  },

  async updateEquipment(id, updates) {
    await delay(350)
    const index = equipment.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Equipment not found')
    
    equipment[index] = { ...equipment[index], ...updates }
    return { ...equipment[index] }
  },

  async deleteEquipment(id) {
    await delay(250)
    const index = equipment.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Equipment not found')
    
    // Also delete related maintenance records
    maintenanceRecords = maintenanceRecords.filter(record => record.equipmentId !== id)
    equipment = equipment.filter(item => item.id !== id)
    return true
  },

  // Maintenance record operations
  async getMaintenanceRecords() {
    await delay(300)
    return [...maintenanceRecords]
  },

  async getMaintenanceRecordById(id) {
    await delay(200)
    const record = maintenanceRecords.find(item => item.id === id)
    if (!record) throw new Error('Maintenance record not found')
    return { ...record }
  },

  async getMaintenanceRecordsByEquipment(equipmentId) {
    await delay(200)
    return maintenanceRecords.filter(record => record.equipmentId === equipmentId)
  },

  async createMaintenanceRecord(recordData) {
    await delay(400)
    const newRecord = {
      ...recordData,
      id: Date.now().toString(),
      status: 'Completed'
    }
    maintenanceRecords = [newRecord, ...maintenanceRecords]
    
    // Update equipment next maintenance date if this was scheduled maintenance
    if (recordData.type === 'Scheduled' && recordData.nextServiceDate) {
      const equipmentIndex = equipment.findIndex(eq => eq.id === recordData.equipmentId)
      if (equipmentIndex !== -1) {
        equipment[equipmentIndex].lastMaintenanceDate = recordData.date
        equipment[equipmentIndex].nextMaintenanceDate = recordData.nextServiceDate
      }
    }
    
    return { ...newRecord }
  },

  async updateMaintenanceRecord(id, updates) {
    await delay(350)
    const index = maintenanceRecords.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Maintenance record not found')
    
    maintenanceRecords[index] = { ...maintenanceRecords[index], ...updates }
    return { ...maintenanceRecords[index] }
  },

  async deleteMaintenanceRecord(id) {
    await delay(250)
    const index = maintenanceRecords.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Maintenance record not found')
    
    maintenanceRecords = maintenanceRecords.filter(item => item.id !== id)
    return true
  },

  // Analytics and reporting
  async getEquipmentSummary() {
    await delay(200)
    const totalEquipment = equipment.length
    const activeEquipment = equipment.filter(eq => eq.status === 'Active').length
    const totalValue = equipment.reduce((sum, eq) => sum + eq.currentValue, 0)
    const avgAge = equipment.reduce((sum, eq) => {
      const ageInYears = (new Date().getFullYear() - new Date(eq.purchaseDate).getFullYear())
      return sum + ageInYears
    }, 0) / equipment.length

    return {
      totalEquipment,
      activeEquipment,
      totalValue,
      avgAge: Math.round(avgAge * 10) / 10
    }
  },

  async getMaintenanceSummary() {
    await delay(200)
    const totalRecords = maintenanceRecords.length
    const totalCost = maintenanceRecords.reduce((sum, record) => sum + record.cost, 0)
    const avgCost = totalCost / totalRecords
    const scheduledMaintenance = maintenanceRecords.filter(record => record.type === 'Scheduled').length
    const repairs = maintenanceRecords.filter(record => record.type === 'Repair').length

    return {
      totalRecords,
      totalCost,
      avgCost,
      scheduledMaintenance,
      repairs
    }
  },

  async getUpcomingMaintenance() {
    await delay(200)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    return equipment
      .filter(eq => eq.nextMaintenanceDate)
      .filter(eq => {
        const maintenanceDate = new Date(eq.nextMaintenanceDate)
        return maintenanceDate <= thirtyDaysFromNow
      })
      .map(eq => ({
        ...eq,
        daysUntilMaintenance: Math.ceil((new Date(eq.nextMaintenanceDate) - today) / (24 * 60 * 60 * 1000))
      }))
      .sort((a, b) => a.daysUntilMaintenance - b.daysUntilMaintenance)
  },

  async getOverdueMaintenance() {
    await delay(200)
    const today = new Date()
    
    return equipment
      .filter(eq => eq.nextMaintenanceDate)
      .filter(eq => new Date(eq.nextMaintenanceDate) < today)
      .map(eq => ({
        ...eq,
        daysOverdue: Math.ceil((today - new Date(eq.nextMaintenanceDate)) / (24 * 60 * 60 * 1000))
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  },

  async getMaintenanceCostsByMonth() {
    await delay(200)
    const costsByMonth = {}
    
    maintenanceRecords.forEach(record => {
      const date = new Date(record.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      costsByMonth[monthKey] = (costsByMonth[monthKey] || 0) + record.cost
    })
    
    return costsByMonth
  },

  async getEquipmentTypes() {
    await delay(100)
    const types = [...new Set(equipment.map(eq => eq.type))]
    return types.sort()
  },

  async getManufacturers() {
    await delay(100)
    const manufacturers = [...new Set(equipment.map(eq => eq.manufacturer))]
    return manufacturers.sort()
  },

  // API compatibility methods
  async getAll() {
    return this.getEquipment()
  },

  async create(equipmentData) {
    return this.createEquipment(equipmentData)
  },

  async update(id, updates) {
    return this.updateEquipment(id, updates)
  },

  async delete(id) {
    return this.deleteEquipment(id)
  }
}

export default equipmentService