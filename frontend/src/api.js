
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export function getToken() {
  return localStorage.getItem('access_token')
}

export function setToken(token) {
  localStorage.setItem('access_token', token)
}

export function clearToken() {
  localStorage.removeItem('access_token')
}

export function isAuthenticated() {
  return Boolean(getToken())
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  })

  let data
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred while communicating with the server.'
    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err) => err.msg || JSON.stringify(err)).join(', ')
      } else if (data.message) {
        errorMessage = data.message
      }
    }
    const error = new Error(errorMessage)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

// ----------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------

export async function login(email, password) {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  const data = await request('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  if (data.access_token) {
    setToken(data.access_token)
  }

  return data
}

export async function register(userData) {
  return request('/api/register', {
    method: 'POST',
    body: userData,
  })
}

export async function getProfile() {
  return request('/api/profile')
}

// ----------------------------------------------------
// Solar Installations
// ----------------------------------------------------

export async function getInstallations() {
  return request('/api/installations/')
}

export async function createInstallation(installationData) {
  return request('/api/installations/', {
    method: 'POST',
    body: installationData,
  })
}

// ----------------------------------------------------
// Live Weather & Solar Position
// ----------------------------------------------------

export async function getCurrentWeather(latitude = 8.8932, longitude = 76.6141) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  })
  return request(`/api/weather/current?${params.toString()}`)
}

export async function getSolarPosition(latitude = 8.8932, longitude = 76.6141, altitude = 0) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    altitude: String(altitude),
  })
  return request(`/api/solar-position/?${params.toString()}`)
}

// ----------------------------------------------------
// Power Generation & History
// ----------------------------------------------------

export async function getPowerHistory(limit = 100) {
  return request(`/api/power/history?limit=${limit}`)
}

export async function getTodayPower() {
  return request('/api/power/today')
}

// ----------------------------------------------------
// Forecast & ML Prediction
// ----------------------------------------------------

export async function getForecasts(limit = 50) {
  return request(`/api/forecast/?limit=${limit}`)
}

export async function generateTestPrediction() {
  return request('/api/forecast/test-prediction', {
    method: 'POST',
  })
}

export async function testHistoricalInput() {
  return request('/api/forecast/historical-input-test', {
    method: 'POST',
  })
}

// ----------------------------------------------------
// Alerts
// ----------------------------------------------------

export async function getAlerts() {
  return request('/api/alerts/')
}

export async function markAlertAsRead(alertId) {
  return request(`/api/alerts/${alertId}/read`, {
    method: 'PATCH',
  })
}
