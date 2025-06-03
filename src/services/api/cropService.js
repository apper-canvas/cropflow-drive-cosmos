import cropData from '../mockData/crop.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let crops = [...cropData]

const cropService = {
  async getAll() {
    await delay(300)
    return [...crops]
  },

  async getById(id) {
    await delay(200)
    const crop = crops.find(item => item.id === id)
    if (!crop) throw new Error('Crop not found')
    return { ...crop }
  },

  async create(cropData) {
    await delay(400)
    const newCrop = {
      ...cropData,
      id: Date.now().toString()
    }
    crops = [newCrop, ...crops]
    return { ...newCrop }
  },

  async update(id, updates) {
    await delay(350)
    const index = crops.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Crop not found')
    
    crops[index] = { ...crops[index], ...updates }
    return { ...crops[index] }
  },

  async delete(id) {
    await delay(250)
    const index = crops.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Crop not found')
    
    crops = crops.filter(item => item.id !== id)
    return true
  }
}

export default cropService