import taskData from '../mockData/task.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let tasks = [...taskData]

const taskService = {
  async getAll() {
    await delay(300)
    return [...tasks]
  },

  async getById(id) {
    await delay(200)
    const task = tasks.find(item => item.id === id)
    if (!task) throw new Error('Task not found')
    return { ...task }
  },

  async create(taskData) {
    await delay(400)
    const newTask = {
      ...taskData,
      id: Date.now().toString()
    }
    tasks = [newTask, ...tasks]
    return { ...newTask }
  },

  async update(id, updates) {
    await delay(350)
    const index = tasks.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Task not found')
    
    tasks[index] = { ...tasks[index], ...updates }
    return { ...tasks[index] }
  },

  async delete(id) {
    await delay(250)
    const index = tasks.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Task not found')
    
    tasks = tasks.filter(item => item.id !== id)
    return true
  }
}

export default taskService