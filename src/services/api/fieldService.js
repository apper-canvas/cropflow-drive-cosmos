import fieldData from '../mockData/field.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let fields = [...fieldData]

const fieldService = {
  async getAll() {
    await delay(300)
    return [...fields]
  },

  async getById(id) {
    await delay(200)
    const field = fields.find(item => item.id === id)
    if (!field) throw new Error('Field not found')
    return { ...field }
  },

  async create(fieldData) {
    await delay(400)
    const newField = {
      ...fieldData,
      id: Date.now().toString()
    }
    fields = [newField, ...fields]
    return { ...newField }
  },

  async update(id, updates) {
    await delay(350)
    const index = fields.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Field not found')
    
    fields[index] = { ...fields[index], ...updates }
    return { ...fields[index] }
  },

  async delete(id) {
    await delay(250)
    const index = fields.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Field not found')
    
    fields = fields.filter(item => item.id !== id)
    return true
  }
}

export default fieldService