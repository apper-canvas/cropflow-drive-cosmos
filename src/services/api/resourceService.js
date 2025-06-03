import resourceData from '../mockData/resource.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let resources = [...resourceData]

const resourceService = {
  async getAll() {
    await delay(300)
    return [...resources]
  },

  async getById(id) {
    await delay(200)
    const resource = resources.find(item => item.id === id)
    if (!resource) throw new Error('Resource not found')
    return { ...resource }
  },

  async create(resourceData) {
    await delay(400)
    const newResource = {
      ...resourceData,
      id: Date.now().toString()
    }
    resources = [newResource, ...resources]
    return { ...newResource }
  },

  async update(id, updates) {
    await delay(350)
    const index = resources.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Resource not found')
    
    resources[index] = { ...resources[index], ...updates }
    return { ...resources[index] }
  },

  async delete(id) {
    await delay(250)
    const index = resources.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Resource not found')
    
    resources = resources.filter(item => item.id !== id)
    return true
  }
}

export default resourceService