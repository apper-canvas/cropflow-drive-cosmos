import axios from 'axios'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

// Mock data fallback
const mockWeatherData = {
  temperature: 24,
  condition: "Partly Cloudy",
  humidity: 65,
  windSpeed: 12,
  forecast: [
    { day: "Today", high: 24, low: 18, rain: 20 },
    { day: "Tomorrow", high: 26, low: 19, rain: 10 },
    { day: "Wed", high: 28, low: 21, rain: 5 },
    { day: "Thu", high: 25, low: 20, rain: 30 },
    { day: "Fri", high: 23, low: 17, rain: 60 }
  ]
}

// Get user's location
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        // Fallback to default location (example: New York)
        resolve({ lat: 40.7128, lon: -74.0060 })
      },
      { timeout: 10000 }
    )
  })
}

// Format weather condition
const formatCondition = (weatherMain, description) => {
  const conditions = {
    'Clear': 'Clear Sky',
    'Clouds': 'Cloudy',
    'Rain': 'Rainy',
    'Drizzle': 'Light Rain',
    'Thunderstorm': 'Thunderstorm',
    'Snow': 'Snowy',
    'Mist': 'Misty',
    'Fog': 'Foggy',
    'Haze': 'Hazy'
  }
  
  return conditions[weatherMain] || description || 'Unknown'
}

// Get day name from timestamp
const getDayName = (timestamp, index) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const date = new Date(timestamp * 1000)
  
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  
  return days[date.getDay()]
}

// Get current weather
const getCurrentWeather = async () => {
  try {
    if (!API_KEY) {
      console.warn('Weather API key not found, using mock data')
      return mockWeatherData
    }

    const location = await getUserLocation()
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: API_KEY,
        units: 'metric'
      }
    })

    const data = response.data
    return {
      temperature: Math.round(data.main.temp),
      condition: formatCondition(data.weather[0].main, data.weather[0].description),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      location: data.name,
      country: data.sys.country
    }
  } catch (error) {
    console.error('Error fetching current weather:', error.message)
    return {
      temperature: mockWeatherData.temperature,
      condition: mockWeatherData.condition,
      humidity: mockWeatherData.humidity,
      windSpeed: mockWeatherData.windSpeed,
      location: 'Unknown',
      country: 'Unknown'
    }
  }
}

// Get weather forecast
const getWeatherForecast = async () => {
  try {
    if (!API_KEY) {
      console.warn('Weather API key not found, using mock data')
      return mockWeatherData.forecast
    }

    const location = await getUserLocation()
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: API_KEY,
        units: 'metric'
      }
    })

    const data = response.data
    const dailyForecasts = []
    const processedDays = new Set()

    // Process forecast data (API returns 3-hour intervals for 5 days)
    data.list.forEach((item, index) => {
      const date = new Date(item.dt * 1000)
      const dayKey = date.toDateString()

      if (!processedDays.has(dayKey) && dailyForecasts.length < 5) {
        processedDays.add(dayKey)
        
        // Find min/max temperatures for the day
        const dayForecasts = data.list.filter(forecast => {
          const forecastDate = new Date(forecast.dt * 1000)
          return forecastDate.toDateString() === dayKey
        })

        const temperatures = dayForecasts.map(f => f.main.temp)
        const rainData = dayForecasts.filter(f => f.weather[0].main === 'Rain')
        
        dailyForecasts.push({
          day: getDayName(item.dt, dailyForecasts.length),
          high: Math.round(Math.max(...temperatures)),
          low: Math.round(Math.min(...temperatures)),
          rain: Math.round((rainData.length / dayForecasts.length) * 100)
        })
      }
    })

    return dailyForecasts.length > 0 ? dailyForecasts : mockWeatherData.forecast
  } catch (error) {
    console.error('Error fetching weather forecast:', error.message)
    return mockWeatherData.forecast
  }
}

// Get complete weather data
const getWeatherData = async () => {
  try {
    const [currentWeather, forecast] = await Promise.all([
      getCurrentWeather(),
      getWeatherForecast()
    ])

    return {
      ...currentWeather,
      forecast
    }
  } catch (error) {
    console.error('Error fetching complete weather data:', error.message)
    return mockWeatherData
  }
}

const weatherService = {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherData
}

export default weatherService