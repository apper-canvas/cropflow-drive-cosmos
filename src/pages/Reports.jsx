import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ReactApexCharts from 'react-apexcharts'
import ApperIcon from '../components/ApperIcon'
import { fieldService, expenseService, taskService, resourceService } from '../services'

const Reports = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    fields: [],
    expenses: [],
    tasks: [],
    resources: []
  })
  const [filters, setFilters] = useState({
    season: 'all',
    year: new Date().getFullYear(),
    fieldId: 'all',
    cropType: 'all',
    startDate: '',
    endDate: ''
  })
  const [reportType, setReportType] = useState('overview')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const [fields, expenses, tasks, resources] = await Promise.all([
        fieldService.getAll(),
        expenseService.getAll(),
        taskService.getAll(),
        resourceService.getAll()
      ])
      
      setData({ fields, expenses, tasks, resources })
    } catch (err) {
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const getSeasonDates = (season, year) => {
    const seasons = {
      spring: { start: `${year}-03-20`, end: `${year}-06-20` },
      summer: { start: `${year}-06-21`, end: `${year}-09-22` },
      fall: { start: `${year}-09-23`, end: `${year}-12-20` },
      winter: { start: `${year}-12-21`, end: `${year + 1}-03-19` }
    }
    return seasons[season] || { start: `${year}-01-01`, end: `${year}-12-31` }
  }

  const filterDataBySeason = (items, dateField = 'date') => {
    if (filters.season === 'all' && !filters.startDate && !filters.endDate) {
      return items.filter(item => {
        const itemDate = new Date(item[dateField])
        return itemDate.getFullYear() === filters.year
      })
    }

    let startDate, endDate
    if (filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate)
      endDate = new Date(filters.endDate)
    } else if (filters.season !== 'all') {
      const seasonDates = getSeasonDates(filters.season, filters.year)
      startDate = new Date(seasonDates.start)
      endDate = new Date(seasonDates.end)
    } else {
      startDate = new Date(`${filters.year}-01-01`)
      endDate = new Date(`${filters.year}-12-31`)
    }

    return items.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  const getFilteredData = () => {
    let filteredExpenses = filterDataBySeason(data.expenses)
    let filteredTasks = filterDataBySeason(data.tasks, 'dueDate')
    let filteredFields = data.fields

    if (filters.fieldId !== 'all') {
      filteredExpenses = filteredExpenses.filter(e => e.fieldId === filters.fieldId)
      filteredTasks = filteredTasks.filter(t => t.fieldId === filters.fieldId)
      filteredFields = filteredFields.filter(f => f.id === filters.fieldId)
    }

    if (filters.cropType !== 'all') {
      filteredExpenses = filteredExpenses.filter(e => e.cropType === filters.cropType)
      filteredTasks = filteredTasks.filter(t => t.cropType === filters.cropType)
      filteredFields = filteredFields.filter(f => f.cropType === filters.cropType)
    }

    return {
      expenses: filteredExpenses,
      tasks: filteredTasks,
      fields: filteredFields,
      resources: data.resources
    }
  }

  const generateYieldChart = () => {
    const filteredData = getFilteredData()
    const yieldByMonth = {}
    
    filteredData.fields.forEach(field => {
      if (field.harvestDate) {
        const month = new Date(field.harvestDate).toLocaleDateString('en-US', { month: 'short' })
        yieldByMonth[month] = (yieldByMonth[month] || 0) + (field.expectedYield || 0)
      }
    })

    return {
      series: [{
        name: 'Yield (tons)',
        data: Object.values(yieldByMonth)
      }],
      options: {
        chart: { type: 'area', background: 'transparent' },
        xaxis: { categories: Object.keys(yieldByMonth) },
        colors: ['#228B22'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        stroke: { curve: 'smooth' },
        title: { text: 'Seasonal Yield Trends', style: { color: '#1e293b' } }
      }
    }
  }

  const generateExpenseChart = () => {
    const filteredData = getFilteredData()
    const expensesByCategory = {}
    
    filteredData.expenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + parseFloat(expense.amount)
    })

    return {
      series: Object.values(expensesByCategory),
      options: {
        chart: { type: 'donut', background: 'transparent' },
        labels: Object.keys(expensesByCategory),
        colors: ['#228B22', '#32CD32', '#FFB347', '#8B4513', '#CD853F', '#FF6B6B'],
        title: { text: 'Expense Distribution', style: { color: '#1e293b' } },
        legend: { position: 'bottom' }
      }
    }
  }

  const generateTaskChart = () => {
    const filteredData = getFilteredData()
    const tasksByStatus = { completed: 0, pending: 0, inProgress: 0 }
    
    filteredData.tasks.forEach(task => {
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1
    })

    return {
      series: [{
        name: 'Tasks',
        data: Object.values(tasksByStatus)
      }],
      options: {
        chart: { type: 'bar', background: 'transparent' },
        xaxis: { categories: ['Completed', 'Pending', 'In Progress'] },
        colors: ['#228B22'],
        title: { text: 'Task Completion Status', style: { color: '#1e293b' } }
      }
    }
  }

  const generateResourceChart = () => {
    const lowStockItems = data.resources.filter(r => r.quantity < r.minStock).length
    const normalStockItems = data.resources.filter(r => r.quantity >= r.minStock).length

    return {
      series: [normalStockItems, lowStockItems],
      options: {
        chart: { type: 'pie', background: 'transparent' },
        labels: ['Normal Stock', 'Low Stock'],
        colors: ['#228B22', '#FF6B6B'],
        title: { text: 'Resource Stock Status', style: { color: '#1e293b' } },
        legend: { position: 'bottom' }
      }
    }
  }

  const calculateSummaryStats = () => {
    const filteredData = getFilteredData()
    
    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
    const completedTasks = filteredData.tasks.filter(t => t.status === 'completed').length
    const totalYield = filteredData.fields.reduce((sum, f) => sum + (f.expectedYield || 0), 0)
    const avgExpensePerField = filteredData.fields.length > 0 ? totalExpenses / filteredData.fields.length : 0

    return {
      totalExpenses,
      completedTasks,
      totalYield,
      avgExpensePerField,
      totalFields: filteredData.fields.length,
      totalTasks: filteredData.tasks.length
    }
  }

  const handleExport = async (format) => {
    setExporting(true)
    try {
      const filteredData = getFilteredData()
      const stats = calculateSummaryStats()
      
      if (format === 'pdf') {
        // Generate PDF report
        const reportContent = {
          title: `Agricultural Report - ${filters.season} ${filters.year}`,
          summary: stats,
          expenses: filteredData.expenses,
          tasks: filteredData.tasks,
          fields: filteredData.fields
        }
        
        // In a real implementation, you would use a PDF library like jsPDF
        console.log('PDF Report Data:', reportContent)
        toast.success('PDF report generated successfully!')
      } else if (format === 'csv') {
        // Generate CSV export
        const csvData = filteredData.expenses.map(expense => ({
          Date: expense.date,
          Description: expense.description,
          Amount: expense.amount,
          Category: expense.category,
          Field: expense.fieldId,
          CropType: expense.cropType || 'N/A'
        }))
        
        const csvContent = [
          Object.keys(csvData[0]).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `agricultural-report-${filters.season}-${filters.year}.csv`
        link.click()
        URL.revokeObjectURL(url)
        
        toast.success('CSV report exported successfully!')
      }
    } catch (err) {
      toast.error('Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  const seasonOptions = [
    { value: 'all', label: 'All Year' },
    { value: 'spring', label: 'Spring (Mar-Jun)' },
    { value: 'summer', label: 'Summer (Jun-Sep)' },
    { value: 'fall', label: 'Fall (Sep-Dec)' },
    { value: 'winter', label: 'Winter (Dec-Mar)' }
  ]

  const stats = calculateSummaryStats()
  const yieldChart = generateYieldChart()
  const expenseChart = generateExpenseChart()
  const taskChart = generateTaskChart()
  const resourceChart = generateResourceChart()

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
          <p className="text-earth-600 dark:text-earth-300">Loading report data...</p>
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
                Agricultural Reports
              </h1>
              <p className="text-earth-600 dark:text-earth-300 text-sm sm:text-base">
                Comprehensive seasonal analysis and insights for your farm operations
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover disabled:opacity-50"
              >
                <ApperIcon name="FileText" className="h-5 w-5 inline mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition-all shadow-earth hover:shadow-earth-hover disabled:opacity-50"
              >
                <ApperIcon name="Download" className="h-5 w-5 inline mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
              Report Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Season
                </label>
                <select
                  value={filters.season}
                  onChange={(e) => setFilters({...filters, season: e.target.value})}
                  className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {seasonOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {[2024, 2023, 2022, 2021, 2020].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Field
                </label>
                <select
                  value={filters.fieldId}
                  onChange={(e) => setFilters({...filters, fieldId: e.target.value})}
                  className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Fields</option>
                  {data.fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="overview">Overview</option>
                  <option value="financial">Financial Analysis</option>
                  <option value="productivity">Productivity Report</option>
                  <option value="resource">Resource Utilization</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Custom Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                  Custom End Date (Optional)
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full px-4 py-2 border border-earth-300 dark:border-earth-600 rounded-lg bg-white dark:bg-earth-700 text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { label: "Total Expenses", value: `$${stats.totalExpenses.toFixed(2)}`, icon: "DollarSign", color: "text-red-600" },
            { label: "Completed Tasks", value: `${stats.completedTasks}/${stats.totalTasks}`, icon: "CheckCircle", color: "text-green-600" },
            { label: "Total Yield", value: `${stats.totalYield.toFixed(1)} tons`, icon: "Wheat", color: "text-primary" },
            { label: "Avg Cost/Field", value: `$${stats.avgExpensePerField.toFixed(2)}`, icon: "BarChart3", color: "text-blue-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-earth-800 rounded-2xl p-4 sm:p-6 shadow-earth hover:shadow-earth-hover transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-earth-600 dark:text-earth-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-earth-800 dark:text-earth-100">
                    {stat.value}
                  </p>
                </div>
                <ApperIcon name={stat.icon} className={`h-8 w-8 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
{/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Yield Chart */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth chart-container">
              <div className="chart-wrapper">
                <ReactApexCharts 
                  options={yieldChart.options} 
                  series={yieldChart.series} 
                  type="area" 
                  height={300}
                />
              </div>
            </div>
</motion.div>

          {/* Expense Chart */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth chart-container">
              <div className="chart-wrapper">
                <ReactApexCharts 
                  options={expenseChart.options} 
                  series={expenseChart.series} 
                  type="donut" 
                  height={300}
                />
              </div>
            </div>
</motion.div>

          {/* Task Chart */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth chart-container">
              <div className="chart-wrapper">
                <ReactApexCharts 
                  options={taskChart.options} 
                  series={taskChart.series} 
                  type="bar" 
                  height={300}
                />
              </div>
            </div>
</motion.div>

          {/* Resource Chart */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth chart-container">
              <div className="chart-wrapper">
                <ReactApexCharts 
                  options={resourceChart.options} 
                  series={resourceChart.series} 
type="pie" 
                  height={300}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Tables */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Expenses */}
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
              Top Expenses
            </h3>
            <div className="space-y-3">
              {getFilteredData().expenses
                .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                .slice(0, 5)
                .map((expense, index) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-earth-50 dark:bg-earth-700 rounded-lg">
                    <div>
                      <p className="font-medium text-earth-800 dark:text-earth-100 text-sm">
                        {expense.description}
                      </p>
                      <p className="text-earth-600 dark:text-earth-400 text-xs capitalize">
                        {expense.category} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-red-600">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white dark:bg-earth-800 rounded-2xl p-6 shadow-earth">
            <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">
              Recent Tasks
            </h3>
            <div className="space-y-3">
              {getFilteredData().tasks
                .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
                .slice(0, 5)
                .map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-earth-50 dark:bg-earth-700 rounded-lg">
                    <div>
                      <p className="font-medium text-earth-800 dark:text-earth-100 text-sm">
                        {task.title}
                      </p>
                      <p className="text-earth-600 dark:text-earth-400 text-xs">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Reports