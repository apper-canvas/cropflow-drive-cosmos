const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data for expenses
let expenses = [
  {
    id: '1',
    description: 'Corn Seeds Purchase',
    amount: 1250.00,
    category: 'seeds',
    fieldId: '1',
    date: '2024-01-15',
    cropType: 'Corn'
  },
  {
    id: '2',
    description: 'Fertilizer Application',
    amount: 850.50,
    category: 'fertilizers',
    fieldId: '1',
    date: '2024-02-20',
    cropType: 'Corn'
  },
  {
    id: '3',
    description: 'Pesticide Treatment',
    amount: 425.75,
    category: 'pesticides',
    fieldId: '2',
    date: '2024-02-25',
    cropType: 'Wheat'
  },
  {
    id: '4',
    description: 'Harvesting Labor',
    amount: 2100.00,
    category: 'labor',
    fieldId: '3',
    date: '2024-03-10',
    cropType: 'Barley'
  },
  {
    id: '5',
    description: 'Tractor Maintenance',
    amount: 750.25,
    category: 'maintenance',
    fieldId: '1',
    date: '2024-03-15',
    cropType: ''
  },
  {
    id: '6',
    description: 'Fuel for Equipment',
    amount: 320.80,
    category: 'fuel',
    fieldId: '2',
    date: '2024-03-20',
    cropType: ''
  },
  {
    id: '7',
    description: 'Irrigation Equipment',
    amount: 1580.00,
    category: 'equipment',
    fieldId: '4',
    date: '2024-04-05',
    cropType: 'Soybeans'
  },
  {
    id: '8',
    description: 'Wheat Seeds',
    amount: 980.25,
    category: 'seeds',
    fieldId: '2',
    date: '2024-04-12',
    cropType: 'Wheat'
  }
]

// Mock data for budgets
let budgets = [
  {
    id: '1',
    category: 'seeds',
    fieldId: '1',
    budgetAmount: 2000.00,
    period: 'yearly',
    year: 2024
  },
  {
    id: '2',
    category: 'fertilizers',
    fieldId: '1',
    budgetAmount: 1500.00,
    period: 'yearly',
    year: 2024
  },
  {
    id: '3',
    category: 'labor',
    fieldId: '2',
    budgetAmount: 3000.00,
    period: 'yearly',
    year: 2024
  },
  {
    id: '4',
    category: 'equipment',
    fieldId: '3',
    budgetAmount: 2500.00,
    period: 'yearly',
    year: 2024
  },
  {
    id: '5',
    category: 'pesticides',
    fieldId: '2',
    budgetAmount: 800.00,
    period: 'yearly',
    year: 2024
  },
  {
    id: '6',
    category: 'fuel',
    fieldId: '4',
    budgetAmount: 1200.00,
    period: 'yearly',
    year: 2024
  }
]

// Mock data for income
let income = []

const expenseService = {
  // Expense operations
  async getExpenses() {
    await delay(300)
    return [...expenses]
  },

  async getExpenseById(id) {
    await delay(200)
    const expense = expenses.find(item => item.id === id)
    if (!expense) throw new Error('Expense not found')
    return { ...expense }
  },

  async createExpense(expenseData) {
    await delay(400)
    const newExpense = {
      ...expenseData,
      id: Date.now().toString()
    }
    expenses = [newExpense, ...expenses]
    return { ...newExpense }
  },

  async updateExpense(id, updates) {
    await delay(350)
    const index = expenses.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Expense not found')
    
    expenses[index] = { ...expenses[index], ...updates }
    return { ...expenses[index] }
  },

  async deleteExpense(id) {
    await delay(250)
    const index = expenses.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Expense not found')
    
    expenses = expenses.filter(item => item.id !== id)
    return true
  },

  // Budget operations
  async getBudgets() {
    await delay(300)
    return [...budgets]
  },

  async getBudgetById(id) {
    await delay(200)
    const budget = budgets.find(item => item.id === id)
    if (!budget) throw new Error('Budget not found')
    return { ...budget }
  },

  async createBudget(budgetData) {
    await delay(400)
    const newBudget = {
      ...budgetData,
      id: Date.now().toString()
    }
    budgets = [newBudget, ...budgets]
    return { ...newBudget }
  },

  async updateBudget(id, updates) {
    await delay(350)
    const index = budgets.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Budget not found')
    
    budgets[index] = { ...budgets[index], ...updates }
    return { ...budgets[index] }
  },

  async deleteBudget(id) {
    await delay(250)
    const index = budgets.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Budget not found')
    
    budgets = budgets.filter(item => item.id !== id)
    return true
  },

  // Analytics operations
  async getExpensesByField(fieldId) {
    await delay(200)
    return expenses.filter(expense => expense.fieldId === fieldId)
  },

  async getExpensesByCategory(category) {
    await delay(200)
    return expenses.filter(expense => expense.category === category)
  },

  async getExpensesByDateRange(startDate, endDate) {
    await delay(200)
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate)
    })
  },

  async getTotalExpensesByField() {
    await delay(200)
    const fieldTotals = {}
    expenses.forEach(expense => {
      if (!fieldTotals[expense.fieldId]) {
        fieldTotals[expense.fieldId] = 0
      }
      fieldTotals[expense.fieldId] += expense.amount
    })
    return fieldTotals
  },

  async getTotalExpensesByCategory() {
    await delay(200)
    const categoryTotals = {}
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0
      }
categoryTotals[expense.category] += expense.amount
    })
    return categoryTotals
  },

  // Income operations
  async getIncome() {
    await delay(300)
    return [...income]
  },

  async getIncomeById(id) {
    await delay(200)
    const incomeItem = income.find(item => item.id === id)
    if (!incomeItem) throw new Error('Income record not found')
    return { ...incomeItem }
  },

  async createIncome(incomeData) {
    await delay(400)
    const newIncome = {
      ...incomeData,
      id: Date.now().toString()
    }
    income = [newIncome, ...income]
    return { ...newIncome }
  },

  async updateIncome(id, updates) {
    await delay(350)
    const index = income.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Income record not found')
    
    income[index] = { ...income[index], ...updates }
    return { ...income[index] }
  },

  async deleteIncome(id) {
    await delay(250)
    const index = income.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Income record not found')
    
    income = income.filter(item => item.id !== id)
    return true
  },

  // Income analytics
  async getIncomeByField(fieldId) {
    await delay(200)
    return income.filter(item => item.fieldId === fieldId)
  },

  async getIncomeByCrop(cropType) {
    await delay(200)
    return income.filter(item => item.cropType === cropType)
  },

  async getTotalIncomeByCrop() {
    await delay(200)
    const cropTotals = {}
    income.forEach(item => {
      if (!cropTotals[item.cropType]) {
        cropTotals[item.cropType] = 0
      }
      cropTotals[item.cropType] += item.amount
    })
    return cropTotals
  },

  async getTotalExpensesByCrop() {
    await delay(200)
    const cropTotals = {}
    expenses.forEach(expense => {
      if (expense.cropType && expense.cropType.trim() !== '') {
        if (!cropTotals[expense.cropType]) {
          cropTotals[expense.cropType] = 0
        }
        cropTotals[expense.cropType] += expense.amount
      }
    })
    return cropTotals
  },

async getProfitabilityByCrop() {
    await delay(300)
    const incomeByCrop = await this.getTotalIncomeByCrop()
    const expensesByCrop = await this.getTotalExpensesByCrop()
    
    const allCrops = new Set([...Object.keys(incomeByCrop), ...Object.keys(expensesByCrop)])
    const profitability = {}
allCrops.forEach(crop => {
      const totalIncome = incomeByCrop[crop] || 0
      const totalExpenses = expensesByCrop[crop] || 0
      const profit = totalIncome - totalExpenses
      const margin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0
      profitability[crop] = {
        income: totalIncome,
        expenses: totalExpenses,
        profit: profit,
        margin: margin,
        profitable: profit > 0
      }
    })
    
    return profitability
  },

  // API compatibility methods
  async getAll() {
    return this.getExpenses()
  },

  async create(expenseData) {
    return this.createExpense(expenseData)
  },

  async update(id, updates) {
    return this.updateExpense(id, updates)
  },

  async delete(id) {
    return this.deleteExpense(id)
  }
}

export default expenseService