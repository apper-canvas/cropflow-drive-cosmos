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