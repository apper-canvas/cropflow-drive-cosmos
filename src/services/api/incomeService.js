// Income Service for managing farm income records
import incomeData from '../mockData/income.json'

class IncomeService {
  constructor() {
    this.income = [...incomeData]
    this.nextId = this.income.length > 0 ? Math.max(...this.income.map(i => i.id)) + 1 : 1
  }

  // Get all income records
  async getAll() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return this.income
    } catch (error) {
      throw new Error('Failed to fetch income records')
    }
  }

  // Get income record by ID
  async getById(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      const income = this.income.find(i => i.id === parseInt(id))
      if (!income) {
        throw new Error('Income record not found')
      }
      return income
    } catch (error) {
      throw new Error(`Failed to fetch income record: ${error.message}`)
    }
  }

  // Create new income record
  async create(incomeData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const newIncome = {
        id: this.nextId++,
        description: incomeData.description,
        amount: parseFloat(incomeData.amount),
        cropType: incomeData.cropType,
        field: incomeData.field,
        date: incomeData.date,
        buyer: incomeData.buyer,
        quantity: incomeData.quantity,
        pricePerUnit: parseFloat(incomeData.pricePerUnit) || 0,
        notes: incomeData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      this.income.push(newIncome)
      return newIncome
    } catch (error) {
      throw new Error(`Failed to create income record: ${error.message}`)
    }
  }

  // Update existing income record
  async update(id, incomeData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const index = this.income.findIndex(i => i.id === parseInt(id))
      if (index === -1) {
        throw new Error('Income record not found')
      }

      const updatedIncome = {
        ...this.income[index],
        description: incomeData.description,
        amount: parseFloat(incomeData.amount),
        cropType: incomeData.cropType,
        field: incomeData.field,
        date: incomeData.date,
        buyer: incomeData.buyer,
        quantity: incomeData.quantity,
        pricePerUnit: parseFloat(incomeData.pricePerUnit) || 0,
        notes: incomeData.notes || '',
        updatedAt: new Date().toISOString()
      }

      this.income[index] = updatedIncome
      return updatedIncome
    } catch (error) {
      throw new Error(`Failed to update income record: ${error.message}`)
    }
  }

  // Delete income record
  async delete(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const index = this.income.findIndex(i => i.id === parseInt(id))
      if (index === -1) {
        throw new Error('Income record not found')
      }

      const deletedIncome = this.income.splice(index, 1)[0]
      return deletedIncome
    } catch (error) {
      throw new Error(`Failed to delete income record: ${error.message}`)
    }
  }

  // Get income by crop type
  async getByCrop(cropType) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      return this.income.filter(i => i.cropType.toLowerCase() === cropType.toLowerCase())
    } catch (error) {
      throw new Error(`Failed to fetch income for crop: ${error.message}`)
    }
  }

  // Get income by field
  async getByField(fieldName) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      return this.income.filter(i => i.field.toLowerCase() === fieldName.toLowerCase())
    } catch (error) {
      throw new Error(`Failed to fetch income for field: ${error.message}`)
    }
  }

  // Get income summary statistics
  async getSummary() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const total = this.income.reduce((sum, i) => sum + i.amount, 0)
      const avgPerSale = this.income.length > 0 ? total / this.income.length : 0
      
      const currentMonth = new Date()
      const monthlyIncome = this.income
        .filter(i => {
          const incomeDate = new Date(i.date)
          return incomeDate.getMonth() === currentMonth.getMonth() && 
                 incomeDate.getFullYear() === currentMonth.getFullYear()
        })
        .reduce((sum, i) => sum + i.amount, 0)

      return {
        total,
        monthly: monthlyIncome,
        average: avgPerSale,
        count: this.income.length
      }
    } catch (error) {
      throw new Error(`Failed to calculate income summary: ${error.message}`)
    }
  }
}

export default new IncomeService()