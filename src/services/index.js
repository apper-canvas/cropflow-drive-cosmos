// Central service exports
export { default as fieldService } from './api/fieldService.js'
export { default as resourceService } from './api/resourceService.js'
export { default as taskService } from './api/taskService.js'
export { default as expenseService } from './api/expenseService.js'
export { default as cropService } from './api/cropService.js'
export { default as equipmentService } from './api/equipmentService.js'

// Service registry for dynamic imports
export const services = {
  field: () => import('./api/fieldService.js'),
  resource: () => import('./api/resourceService.js'),
  task: () => import('./api/taskService.js'),
  expense: () => import('./api/expenseService.js'),
  crop: () => import('./api/cropService.js'),
  equipment: () => import('./api/equipmentService.js')
}

// Utility function to get service by name
export const getService = async (serviceName) => {
  const serviceLoader = services[serviceName]
  if (!serviceLoader) {
    throw new Error(`Service '${serviceName}' not found`)
  }
  const module = await serviceLoader()
  return module.default
}