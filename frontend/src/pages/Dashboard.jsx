
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import Brand from '../components/Brand'
import {
  isAuthenticated,
  clearToken,
  getProfile,
  getInstallations,
  createInstallation,
  getCurrentWeather,
  getSolarPosition,
  getPowerHistory,
  getTodayPower,
  getForecasts,
  generateTestPrediction,
  getAlerts,
  markAlertAsRead,
} from '../api'

const navItems = [
  { name: 'Overview', icon: '◫' },
  { name: 'Energy Analytics', icon: '⌁' },
  { name: 'Weather & Forecast', icon: '☀' },
  { name: 'Alerts', icon: '♧' },
  { name: 'Settings', icon: '⚙' },
]

function Dashboard() {
  const navigate = useNavigate()

  const [activePage, setActivePage] = useState('Overview')
  const [profile, setProfile] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  // Installation state
  const [installation, setInstallation] = useState({
    installation_id: null,
    installation_name: 'My Solar Plant',
    latitude: 8.8932,
    longitude: 76.6141,
    capacity_kw: 5.0,
    number_of_panels: 10,
    panel_type: 'Monocrystalline',
    tilt_angle: 10.0,
    azimuth_angle: 180.0,
  })

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    installation_name: 'My Solar Plant',
    latitude: '8.8932',
    longitude: '76.6141',
    capacity_kw: '5.0',
    number_of_panels: '10',
    panel_type: 'Monocrystalline',
    tilt_angle: '10.0',
    azimuth_angle: '180.0',
  })
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)

  // Live Weather state
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [weatherLastUpdated, setWeatherLastUpdated] = useState('')

  // Solar position state
  const [solarPos, setSolarPos] = useState(null)
  const [solarLoading, setSolarLoading] = useState(false)

  // Power & History state
  const [powerHistory, setPowerHistory] = useState([])
  const [todayPower, setTodayPower] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Forecast state
  const [forecastData, setForecastData] = useState([])
  const [forecastMeta, setForecastMeta] = useState(null)
  const [forecastGenerating, setForecastGenerating] = useState(false)
  const [forecastMessage, setForecastMessage] = useState('')
  const [recentForecasts, setRecentForecasts] = useState([])

  // Alerts state
  const [alerts, setAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(false)

  // ----------------------------------------------------
  // Authentication Guard
  // ----------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    async function loadInitialUserData() {
      try {
        const user = await getProfile()
        setProfile(user)
      } catch (err) {
        if (err.status === 401) {
          clearToken()
          navigate('/login')
          return
        }
      }

      try {
        const instResponse = await getInstallations()
        if (instResponse && instResponse.data && instResponse.data.length > 0) {
          const firstInst = instResponse.data[0]
          setInstallation(firstInst)
          setSettingsForm({
            installation_name: firstInst.installation_name || 'My Solar Plant',
            latitude: String(firstInst.latitude || 8.8932),
            longitude: String(firstInst.longitude || 76.6141),
            capacity_kw: String(firstInst.capacity_kw || 5.0),
            number_of_panels: String(firstInst.number_of_panels || 10),
            panel_type: firstInst.panel_type || 'Monocrystalline',
            tilt_angle: String(firstInst.tilt_angle || 10.0),
            azimuth_angle: String(firstInst.azimuth_angle || 180.0),
          })
        }
      } catch (err) {
        console.warn('Could not load installations:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    loadInitialUserData()
  }, [navigate])

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  // ----------------------------------------------------
  // Load Live Weather & Solar Position
  // ----------------------------------------------------
  const fetchWeatherAndSolar = useCallback(async (lat, lon) => {
    if (lat === undefined || lon === undefined) return

    setWeatherLoading(true)
    setSolarLoading(true)
    setWeatherError('')

    try {
      const weatherRes = await getCurrentWeather(lat, lon)
      if (weatherRes && weatherRes.status === 'success') {
        setWeather(weatherRes)
        setWeatherLastUpdated(new Date().toLocaleTimeString())
      } else {
        setWeatherError(weatherRes.message || 'Unable to fetch current weather.')
      }
    } catch (err) {
      setWeatherError(err.message || 'Network error fetching weather.')
    } finally {
      setWeatherLoading(false)
    }

    try {
      const solarRes = await getSolarPosition(lat, lon)
      setSolarPos(solarRes)
    } catch (err) {
      console.warn('Error fetching solar position:', err)
    } finally {
      setSolarLoading(false)
    }
  }, [])

  useEffect(() => {
    if (installation.latitude && installation.longitude) {
      fetchWeatherAndSolar(installation.latitude, installation.longitude)
    }
  }, [installation.latitude, installation.longitude, fetchWeatherAndSolar])

  // ----------------------------------------------------
  // Load Power Generation History & Today's Summary
  // ----------------------------------------------------
  const fetchPowerData = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const [historyRes, todayRes] = await Promise.all([
        getPowerHistory(30),
        getTodayPower(),
      ])

      if (historyRes && historyRes.data) {
        // Reverse to display chronological left-to-right
        const formatted = historyRes.data
          .slice()
          .reverse()
          .map((item) => {
            const dateObj = item.timestamp ? new Date(item.timestamp) : null
            const timeStr = dateObj
              ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : String(item.id)
            const dateStr = dateObj
              ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
              : '2020'
            return {
              time: timeStr,
              date: dateStr,
              fullDateTime: dateObj ? `${dateStr} ${timeStr}` : String(item.id),
              ac_power: item.ac_power ? Math.round(item.ac_power) : 0,
              dc_power: item.dc_power ? Math.round(item.dc_power) : 0,
              daily_yield: item.daily_yield ? Math.round(item.daily_yield) : 0,
              rawTimestamp: item.timestamp,
            }
          })
        setPowerHistory(formatted)
      }

      if (todayRes) {
        setTodayPower(todayRes)
      }
    } catch (err) {
      console.warn('Error fetching power generation data:', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPowerData()
  }, [fetchPowerData])

  // ----------------------------------------------------
  // Load Recent Forecasts from DB
  // ----------------------------------------------------
  const fetchSavedForecasts = useCallback(async () => {
    try {
      const res = await getForecasts(16)
      if (res && res.data && res.data.length > 0) {
        setRecentForecasts(res.data)
        // Format as chart points if no freshly generated forecast is in view
        setForecastData((prev) => {
          if (prev.length > 0) return prev
          return res.data.map((item, idx) => {
            const timeStr = item.forecast_timestamp
              ? new Date(item.forecast_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : `+${(idx + 1) * 15}m`
            return {
              step: idx + 1,
              time: timeStr,
              power: Math.round(item.predicted_ac_power || 0),
            }
          })
        })
      }
    } catch (err) {
      console.warn('Error fetching saved forecasts:', err)
    }
  }, [])

  useEffect(() => {
    fetchSavedForecasts()
  }, [fetchSavedForecasts])

  // ----------------------------------------------------
  // Run CNN-LSTM Prediction
  // ----------------------------------------------------
  async function handleGenerateForecast() {
    setForecastGenerating(true)
    setForecastMessage('')

    try {
      const res = await generateTestPrediction()
      if (res.status === 'success' && Array.isArray(res.predictions)) {
        const now = new Date()
        const chartPoints = res.predictions.map((val, idx) => {
          const futureDate = new Date(now.getTime() + (idx + 1) * 15 * 60 * 1000)
          return {
            step: idx + 1,
            time: futureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            power: Math.round(val),
          }
        })
        setForecastData(chartPoints)
        setForecastMeta(res)
        setForecastMessage('CNN-LSTM forecast generated and saved to PostgreSQL successfully!')
        // Refresh saved list
        fetchSavedForecasts()
      } else {
        setForecastMessage(res.message || 'Forecast generation returned an error.')
      }
    } catch (err) {
      setForecastMessage(err.message || 'Failed to trigger forecast.')
    } finally {
      setForecastGenerating(false)
    }
  }

  // ----------------------------------------------------
  // Load Alerts
  // ----------------------------------------------------
  const fetchAlertsList = useCallback(async () => {
    setAlertsLoading(true)
    try {
      const res = await getAlerts()
      if (res && res.data) {
        setAlerts(res.data)
      }
    } catch (err) {
      console.warn('Error fetching alerts:', err)
    } finally {
      setAlertsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlertsList()
  }, [fetchAlertsList])

  async function handleMarkAlertRead(alertId) {
    try {
      await markAlertAsRead(alertId)
      setAlerts((prev) =>
        prev.map((a) => (a.alert_id === alertId ? { ...a, is_read: true } : a))
      )
    } catch (err) {
      console.warn('Could not mark alert as read:', err)
    }
  }

  // ----------------------------------------------------
  // Geolocation & Settings Handling
  // ----------------------------------------------------
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setSettingsMessage({
        type: 'error',
        text: 'Geolocation is not supported by your browser.',
      })
      return
    }

    setGeoLocating(true)
    setSettingsMessage({ type: '', text: '' })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4)
        const lon = position.coords.longitude.toFixed(4)
        setSettingsForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
        }))
        setGeoLocating(false)
        setSettingsMessage({
          type: 'success',
          text: `Retrieved current coordinates: ${lat}° N, ${lon}° E. Click "Save Installation" to apply.`,
        })
      },
      (error) => {
        setGeoLocating(false)
        let msg = 'Could not retrieve your location.'
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. You can manually enter latitude and longitude.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.'
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.'
        }
        setSettingsMessage({ type: 'error', text: msg })
      },
      { timeout: 10000, enableHighAccuracy: false }
    )
  }

  async function handleSaveSettings(event) {
    event.preventDefault()
    setSettingsMessage({ type: '', text: '' })
    setIsSavingSettings(true)

    const lat = parseFloat(settingsForm.latitude)
    const lon = parseFloat(settingsForm.longitude)
    const cap = parseFloat(settingsForm.capacity_kw)
    const panels = parseInt(settingsForm.number_of_panels, 10) || null
    const tilt = parseFloat(settingsForm.tilt_angle) || null
    const azimuth = parseFloat(settingsForm.azimuth_angle) || null

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setSettingsMessage({ type: 'error', text: 'Latitude must be between -90 and 90.' })
      setIsSavingSettings(false)
      return
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      setSettingsMessage({ type: 'error', text: 'Longitude must be between -180 and 180.' })
      setIsSavingSettings(false)
      return
    }

    if (isNaN(cap) || cap <= 0) {
      setSettingsMessage({ type: 'error', text: 'Capacity must be greater than 0 kW.' })
      setIsSavingSettings(false)
      return
    }

    try {
      const payload = {
        installation_name: settingsForm.installation_name.trim() || 'My Solar Plant',
        latitude: lat,
        longitude: lon,
        capacity_kw: cap,
        number_of_panels: panels,
        panel_type: settingsForm.panel_type || 'Monocrystalline',
        tilt_angle: tilt,
        azimuth_angle: azimuth,
      }

      const saved = await createInstallation(payload)
      setInstallation(saved)
      setSettingsMessage({
        type: 'success',
        text: 'Installation settings updated and saved to PostgreSQL!',
      })
      // Refresh live weather and solar position for new coordinates
      fetchWeatherAndSolar(lat, lon)
    } catch (err) {
      setSettingsMessage({
        type: 'error',
        text: err.message || 'Could not save installation.',
      })
    } finally {
      setIsSavingSettings(false)
    }
  }

  // ----------------------------------------------------
  // Subcomponents: Overview, Analytics, Weather, Alerts, Settings
  // ----------------------------------------------------

  function SectionTitle({ title, description }) {
    return (
      <div className="mb-7">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#39845A]">
          GRIDPULSE WORKSPACE
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#183D30] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[#748078]">{description}</p>
      </div>
    )
  }

  function Overview() {
    const latestRecord = powerHistory.length > 0 ? powerHistory[powerHistory.length - 1] : null

    return (
      <>
        {/* Banner */}
        <section className="relative mt-8 overflow-hidden rounded-[1.75rem] bg-[#123D32] p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-medium text-[#C8F169]">
                <span className="h-2 w-2 rounded-full bg-[#C8F169]" />
                ACTIVE INSTALLATION: {installation.installation_name}
              </div>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Make every ray count.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#D0DED5]">
                Real-time solar monitoring for{' '}
                <span className="font-semibold text-white">
                  {installation.latitude.toFixed(4)}° N, {installation.longitude.toFixed(4)}° E
                </span>{' '}
                with AI-driven 4-hour ultra-short-term generation forecasting.
              </p>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-5xl">
              ☀
            </div>
          </div>
        </section>

        {/* Metric Cards */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#183D30]">
              Performance & Environmental Status
            </h2>
            <span className="text-xs text-[#39845A] font-semibold">
              Live Backend Connected
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#E3EAE0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[#748078]">System Capacity</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6EA] text-xl">⚡</span>
              </div>
              <p className="mt-5 text-3xl font-bold text-[#183D30]">
                {installation.capacity_kw}{' '}
                <span className="text-base font-medium">kW</span>
              </p>
              <p className="mt-2 text-xs text-[#39845A]">
                {installation.number_of_panels ? `${installation.number_of_panels} panels` : 'Configured capacity'} · {installation.panel_type || 'Solar PV'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E3EAE0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[#748078]">AI-Predicted Solar Power</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6EA] text-xl">⚡</span>
              </div>
              {forecastGenerating ? (
                <div className="mt-5">
                  <p className="text-2xl font-bold text-[#183D30]">Generating...</p>
                  <p className="mt-2 text-xs text-[#748078]">Running CNN-LSTM inference</p>
                </div>
              ) : forecastData.length > 0 ? (
                <div>
                  <p className="mt-5 text-3xl font-bold text-[#183D30]">
                    {(forecastData[0].power / 1000).toFixed(2)}{' '}
                    <span className="text-base font-medium">kW</span>
                  </p>
                  <p className="mt-2 text-xs text-[#39845A]">
                    CNN-LSTM prediction · next 15-minute step ({forecastData[0].power} W at {forecastData[0].time})
                  </p>
                  <p className="mt-1 text-[11px] text-[#98A39A]">
                    Predicted value · not measured
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#183D30]">
                    Generate forecast to view prediction
                  </p>
                  <p className="mt-2 text-xs text-[#748078]">
                    Click "Run CNN-LSTM Prediction" below to view forecasted generation.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#E3EAE0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[#748078]">Live Ambient Temp</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6EA] text-xl">🌡</span>
              </div>
              <p className="mt-5 text-3xl font-bold text-[#183D30]">
                {weatherLoading ? '...' : weather?.ambient_temperature !== undefined ? `${weather.ambient_temperature}°C` : 'N/A'}
              </p>
              <p className="mt-2 text-xs text-[#39845A]">
                {weather ? `Open-Meteo · Humidity: ${weather.humidity}%` : weatherError || 'Loading weather...'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E3EAE0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[#748078]">Solar Elevation</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6EA] text-xl">☀️</span>
              </div>
              <p className="mt-5 text-3xl font-bold text-[#183D30]">
                {solarLoading ? '...' : solarPos?.solar_elevation !== undefined ? `${solarPos.solar_elevation}°` : 'N/A'}
              </p>
              <p className="mt-2 text-xs text-[#39845A]">
                {solarPos?.daylight_hours ? `${solarPos.daylight_hours} daylight hrs (pvlib)` : 'Azimuth: ' + (solarPos?.solar_azimuth || 'N/A') + '°'}
              </p>
            </div>
          </div>
        </section>

        {/* Forecast Preview Chart */}
        <section className="mt-8 rounded-2xl border border-[#E3EAE0] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#39845A]">
                <span className="h-2 w-2 rounded-full bg-[#39845A]" />
                CNN-LSTM 4-Hour Solar Forecast
              </div>
              <h3 className="mt-1 text-lg font-bold text-[#183D30]">
                Predicted Power Output (Watts)
              </h3>
              <p className="mt-1 text-xs text-[#748078]">
                16 time steps (15-min intervals). Model: <span className="font-semibold text-[#183D30]">best_cnn_lstm.keras</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateForecast}
              disabled={forecastGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#174B38] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#103D2D] disabled:opacity-60"
            >
              {forecastGenerating ? 'Generating...' : '⚡ Run CNN-LSTM Prediction'}
            </button>
          </div>

          <div className="mt-6 h-72">
            {forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="forecastFillOverview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#39845A" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#39845A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E8EEE6" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: '#879188', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#879188', fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value} W`, 'Predicted Power']} />
                  <Area type="monotone" dataKey="power" stroke="#247A58" strokeWidth={3} fill="url(#forecastFillOverview)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-[#748078]">
                <p className="text-sm">No forecast points generated yet.</p>
                <p className="mt-1 text-xs">Click "Run CNN-LSTM Prediction" to test the model pipeline.</p>
              </div>
            )}
          </div>
          <p className="mt-3 text-right text-[11px] text-[#98A39A]">
            Held-out sequence test prediction · Target inverse transformed to Watts
          </p>
        </section>
      </>
    )
  }

  function EnergyAnalytics() {
    return (
      <>
        <SectionTitle
          title="Energy Analytics"
          description="Historical Plant 1 solar generation dataset (May-June 2020) stored in PostgreSQL table power_generation."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E3EAE0] bg-white p-6">
            <p className="text-sm text-[#748078]">Sample Window Records</p>
            <p className="mt-3 text-3xl font-bold text-[#174B38]">
              {powerHistory.length > 0 ? `${powerHistory.length} readings` : 'Loading...'}
            </p>
            <p className="mt-2 text-xs text-[#748078]">
              Plant 1 historical logs (May-June 2020)
            </p>
          </div>

          <div className="rounded-2xl border border-[#E3EAE0] bg-white p-6">
            <p className="text-sm text-[#748078]">Peak AC Power in Sample</p>
            <p className="mt-3 text-3xl font-bold text-[#174B38]">
              {powerHistory.length > 0
                ? `${Math.max(...powerHistory.map((p) => p.ac_power)).toLocaleString()} W`
                : '0 W'}
            </p>
            <p className="mt-2 text-xs text-[#748078]">
              Maximum output across 30-reading sample window
            </p>
          </div>

          <div className="rounded-2xl border border-[#E3EAE0] bg-white p-6">
            <p className="text-sm text-[#748078]">Average AC Power in Sample</p>
            <p className="mt-3 text-3xl font-bold text-[#174B38]">
              {powerHistory.length > 0
                ? `${Math.round(
                    powerHistory.reduce((acc, curr) => acc + curr.ac_power, 0) / powerHistory.length
                  ).toLocaleString()} W`
                : '0 W'}
            </p>
            <p className="mt-2 text-xs text-[#748078]">
              Mean output across 30-reading sample window
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-[#E3EAE0] bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#183D30]">Historical AC Power Output (Plant 1 — 2020)</h3>
              <p className="mt-1 text-xs text-[#748078]">
                Recorded time-series ground-truth readings from PostgreSQL (table: power_generation)
              </p>
            </div>
            <button
              type="button"
              onClick={fetchPowerData}
              disabled={historyLoading}
              className="rounded-lg border border-[#DDE9D9] px-3 py-1.5 text-xs font-semibold text-[#174B38] hover:bg-[#F0F6EC]"
            >
              {historyLoading ? 'Refreshing...' : '↻ Refresh Data'}
            </button>
          </div>

          <div className="mt-6 h-80">
            {powerHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={powerHistory}>
                  <defs>
                    <linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#247A58" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#247A58" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E8EEE6" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: '#879188', fontSize: 11 }} />
                  <YAxis unit=" W" tick={{ fill: '#879188', fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0 && payload[0].payload.fullDateTime) {
                        return `Recorded: ${payload[0].payload.fullDateTime}`
                      }
                      return label
                    }}
                    formatter={(value) => [`${value} W`, 'Historical AC Power']}
                  />
                  <Area type="monotone" dataKey="ac_power" stroke="#174B38" strokeWidth={2.5} fill="url(#historyFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#748078]">
                Loading power history...
              </div>
            )}
          </div>
          <p className="mt-3 text-right text-[11px] text-[#98A39A]">
            Historical benchmark dataset · Not live sensor telemetry
          </p>
        </section>
      </>
    )
  }

  function WeatherForecast() {
    return (
      <>
        <SectionTitle
          title="Live Weather & Solar Forecast"
          description="Real-time Open-Meteo meteorological data and pvlib astronomical calculations for your installation coordinates."
        />

        {/* Location Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DDE9D9] bg-[#F7FAF6] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6EA] text-xl">📍</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#39845A]">
                Target Installation Coordinates
              </p>
              <p className="text-sm font-semibold text-[#183D30]">
                {installation.installation_name} — {installation.latitude.toFixed(4)}° N, {installation.longitude.toFixed(4)}° E
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchWeatherAndSolar(installation.latitude, installation.longitude)}
            disabled={weatherLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#174B38] border border-[#DDE9D9] shadow-sm hover:bg-[#F0F6EC]"
          >
            {weatherLoading ? 'Refreshing...' : '↻ Refresh Weather'}
          </button>
        </div>

        {/* Live Weather Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-[#123D32] p-7 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#C8F169]">
                Live Open-Meteo Weather
              </span>
              {weatherLastUpdated && (
                <span className="text-[11px] text-[#B7CEC0]">Updated at {weatherLastUpdated}</span>
              )}
            </div>

            {weatherLoading ? (
              <p className="mt-8 text-center text-sm text-[#D0DED5]">Fetching live weather data...</p>
            ) : weather ? (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-bold">{weather.ambient_temperature}°C</p>
                    <p className="mt-2 text-sm text-[#D0DED5]">
                      Cloud Cover: {weather.cloud_cover}% · Wind: {weather.wind_speed} {weather.wind_speed_unit || 'km/h'}
                    </p>
                    <p className="mt-1 text-xs text-[#B7CEC0]">
                      Observed: {weather.timestamp ? new Date(weather.timestamp).toLocaleString() : 'Live'} · Provider: {weather.provider || 'Open-Meteo'}
                    </p>
                  </div>
                  <span className="text-6xl">
                    {weather.cloud_cover > 75 ? '☁️' : weather.cloud_cover > 25 ? '⛅' : '☀️'}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                  <div>
                    <p className="text-xs text-[#B7CEC0]">Humidity</p>
                    <p className="mt-1 text-base font-semibold">{weather.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#B7CEC0]">Cloud Cover</p>
                    <p className="mt-1 text-base font-semibold">{weather.cloud_cover}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#B7CEC0]">Wind Speed</p>
                    <p className="mt-1 text-base font-semibold">{weather.wind_speed} {weather.wind_speed_unit || 'km/h'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-8 text-sm text-red-200">{weatherError || 'Weather data unavailable.'}</p>
            )}
          </div>

          {/* Solar Position Card */}
          <div className="rounded-2xl border border-[#E3EAE0] bg-white p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#183D30]">Solar Position (pvlib)</h3>
              <span className="text-xs text-[#39845A] font-semibold">Asia/Kolkata</span>
            </div>

            {solarPos ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-[#F6F8F5] p-3">
                    <p className="text-xs text-[#748078]">Elevation</p>
                    <p className="mt-1 text-xl font-bold text-[#174B38]">{solarPos.solar_elevation}°</p>
                  </div>
                  <div className="rounded-xl bg-[#F6F8F5] p-3">
                    <p className="text-xs text-[#748078]">Azimuth</p>
                    <p className="mt-1 text-xl font-bold text-[#174B38]">{solarPos.solar_azimuth}°</p>
                  </div>
                  <div className="rounded-xl bg-[#F6F8F5] p-3">
                    <p className="text-xs text-[#748078]">Zenith</p>
                    <p className="mt-1 text-xl font-bold text-[#174B38]">{solarPos.solar_zenith}°</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E8EEE6] p-4">
                  <div className="flex items-center justify-between text-xs text-[#748078]">
                    <span>🌅 Sunrise: <strong className="text-[#183D30]">{solarPos.sunrise || 'N/A'}</strong></span>
                    <span>🌇 Sunset: <strong className="text-[#183D30]">{solarPos.sunset || 'N/A'}</strong></span>
                  </div>
                  <div className="mt-2 text-xs text-[#39845A] font-semibold text-center">
                    Daylight Duration: {solarPos.daylight_hours || 'N/A'} hours
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#748078]">Calculating solar position...</p>
            )}
          </div>
        </div>

        {/* CNN-LSTM Forecasting Section */}
        <section className="mt-8 rounded-2xl border border-[#E3EAE0] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-[#EFF6EA] px-3 py-1 text-xs font-semibold text-[#247A58]">
                MACHINE LEARNING INFERENCE
              </span>
              <h3 className="mt-2 text-xl font-bold text-[#183D30]">
                CNN-LSTM Solar Power Forecast (4-Hour Horizon)
              </h3>
              <p className="mt-1 text-sm text-[#748078]">
                Generates 16 step predictions at 15-minute intervals. Uses 10 scaled meteorological & temporal features.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateForecast}
              disabled={forecastGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#174B38] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#174B38]/10 hover:bg-[#103D2D] disabled:opacity-60"
            >
              {forecastGenerating ? 'Running Inference...' : '⚡ Generate Forecast'}
            </button>
          </div>

          {forecastMessage && (
            <p className="mt-4 rounded-xl border border-[#DDE9D9] bg-[#F3F8F0] p-3 text-xs font-medium text-[#247A58]">
              {forecastMessage}
            </p>
          )}

          <div className="mt-6 h-80">
            {forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#247A58" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#247A58" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E8EEE6" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: '#879188', fontSize: 12 }} />
                  <YAxis unit=" W" tick={{ fill: '#879188', fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value} W`, 'AI-Predicted AC Power']} />
                  <Area type="monotone" dataKey="power" stroke="#174B38" strokeWidth={3} fill="url(#forecastFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-[#748078]">
                <p className="text-sm">Click "Generate Forecast" to run the CNN-LSTM model.</p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl bg-[#F6F8F5] p-4 text-xs leading-5 text-[#748078]">
            <p className="font-semibold text-[#183D30]">Machine Learning Pipeline & Data Architecture:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>
                <strong>Deep Learning Architecture:</strong> Hybrid CNN-LSTM (<code className="text-[#174B38]">Conv1D</code> feature extraction + <code className="text-[#174B38]">LSTM</code> sequential memory) trained on 10 standardized features.
              </li>
              <li>
                <strong>Prediction Horizon:</strong> 16 forward steps at 15-minute intervals (4 hours total). Target inverse-scaled from MinMaxScaler to Watts.
              </li>
              <li>
                <strong>Prediction Pipeline Disclosure:</strong> Forecasts are generated using a held-out benchmark test sequence from <code className="text-[#174B38]">data/X_test.npy</code> evaluated by <code className="text-[#174B38]">models/best_cnn_lstm.keras</code> and saved to PostgreSQL table <code className="text-[#174B38]">solar_forecasts</code>. They demonstrate model performance on standard sequence patterns rather than live streaming inverter feeds.
              </li>
              <li>
                <strong>Data Separation:</strong> Weather values above reflect live Open-Meteo readings; Energy Analytics reflects historical 2020 Plant 1 records; this forecast represents neural network output.
              </li>
            </ul>
          </div>
        </section>
      </>
    )
  }

  function Alerts() {
    return (
      <>
        <SectionTitle
          title="System Alerts"
          description="Real-time operational notices, inverter diagnostics, and weather warnings."
        />

        <div className="space-y-4">
          {alertsLoading ? (
            <p className="text-sm text-[#748078]">Loading alerts from database...</p>
          ) : alerts.length === 0 ? (
            <div className="rounded-2xl border border-[#DDE9D9] bg-white p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6EA] text-2xl text-[#247A58]">
                  ✓
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#174B38]">
                    No active alerts
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#748078]">
                    All solar equipment and environmental metrics are operating within normal parameters.
                    No generation abnormalities or weather warnings detected.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className={`rounded-2xl border p-5 transition ${
                  alert.is_read
                    ? 'border-[#E3EAE0] bg-white opacity-70'
                    : 'border-[#C8F169] bg-[#FAFDF7] shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg">
                      {alert.severity === 'critical' ? '⚠️' : alert.severity === 'warning' ? '⚡' : 'ℹ️'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#39845A]">
                          {alert.alert_type || 'System Alert'}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : alert.severity === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {alert.severity || 'info'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#183D30] font-medium">{alert.message}</p>
                      <p className="mt-1 text-xs text-[#98A39A]">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>

                  {!alert.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAlertRead(alert.alert_id)}
                      className="rounded-lg border border-[#DDE9D9] px-3 py-1.5 text-xs font-semibold text-[#174B38] hover:bg-[#EFF6EA]"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </>
    )
  }

  function Settings() {
    return (
      <>
        <SectionTitle
          title="Installation Settings"
          description="Configure your solar system name, location coordinates, and capacity stored in PostgreSQL."
        />

        <section className="max-w-2xl rounded-2xl border border-[#E3EAE0] bg-white p-6 sm:p-8">
          <h3 className="text-lg font-bold text-[#183D30]">Solar Plant Specifications</h3>

          <form onSubmit={handleSaveSettings} className="mt-6 space-y-5">
            <div>
              <label htmlFor="systemName" className="mb-2 block text-sm font-semibold text-[#34463B]">
                Installation name
              </label>
              <input
                id="systemName"
                value={settingsForm.installation_name}
                onChange={(e) => setSettingsForm({ ...settingsForm, installation_name: e.target.value })}
                required
                className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#39845A] focus:ring-4 focus:ring-[#39845A]/10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="latitude" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Latitude (°N)
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={settingsForm.latitude}
                  onChange={(e) => setSettingsForm({ ...settingsForm, latitude: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#39845A] focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Longitude (°E)
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={settingsForm.longitude}
                  onChange={(e) => setSettingsForm({ ...settingsForm, longitude: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#39845A] focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>
            </div>

            {/* Geolocation Button */}
            <div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLocating}
                className="inline-flex items-center gap-2 rounded-xl border border-[#DDE9D9] bg-[#F7FAF6] px-4 py-2.5 text-xs font-semibold text-[#174B38] hover:bg-[#EFF6EA] disabled:opacity-60"
              >
                <span>📍</span>
                {geoLocating ? 'Detecting browser location...' : 'Use my current location'}
              </button>
              <p className="mt-1 text-[11px] text-[#879188]">
                Uses your device's browser location. If permission is denied, your saved coordinates are retained.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="capacity" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  System capacity (kW)
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={settingsForm.capacity_kw}
                  onChange={(e) => setSettingsForm({ ...settingsForm, capacity_kw: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#39845A] focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>

              <div>
                <label htmlFor="panels" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Number of panels
                </label>
                <input
                  id="panels"
                  type="number"
                  min="1"
                  value={settingsForm.number_of_panels}
                  onChange={(e) => setSettingsForm({ ...settingsForm, number_of_panels: e.target.value })}
                  className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#39845A] focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tilt" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Panel tilt angle (°)
                </label>
                <input
                  id="tilt"
                  type="number"
                  min="0"
                  max="90"
                  step="0.5"
                  value={settingsForm.tilt_angle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tilt_angle: e.target.value })}
                  className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#39845A] focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>

              <div>
                <label htmlFor="azimuth" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Azimuth angle (°)
                </label>
                <input
                  id="azimuth"
                  type="number"
                  min="0"
                  max="360"
                  step="1"
                  value={settingsForm.azimuth_angle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, azimuth_angle: e.target.value })}
                  className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#39845A] focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174B38] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#174B38]/10 hover:bg-[#103D2D] disabled:opacity-70"
            >
              {isSavingSettings ? 'Saving to Database...' : 'Save Installation Settings'}
            </button>

            {settingsMessage.text && (
              <p
                className={`rounded-xl border p-3 text-sm ${
                  settingsMessage.type === 'success'
                    ? 'border-[#DDE9D9] bg-[#F3F8F0] text-[#247A58]'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {settingsMessage.text}
              </p>
            )}
          </form>
        </section>
      </>
    )
  }

  function renderPage() {
    switch (activePage) {
      case 'Energy Analytics':
        return <EnergyAnalytics />
      case 'Weather & Forecast':
        return <WeatherForecast />
      case 'Alerts':
        return <Alerts />
      case 'Settings':
        return <Settings />
      default:
        return <Overview />
    }
  }

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8F5] text-[#183D30]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#174B38] border-t-transparent" />
          <p className="text-sm font-semibold">Loading GridPulse Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#26352E] lg:flex">
      {/* Sidebar */}
      <aside className="flex w-full flex-col border-r border-[#E4EAE3] bg-white lg:fixed lg:inset-y-0 lg:w-64">
        <div className="border-b border-[#E8EEE6] px-6 py-6">
          <Brand />
        </div>

        <div className="px-5 py-6">
          <p className="mb-4 px-3 text-[10px] font-bold tracking-[0.18em] text-[#98A39A]">WORKSPACE</p>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {navItems.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActivePage(item.name)}
                aria-current={activePage === item.name ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activePage === item.name
                    ? 'bg-[#123D32] text-white shadow-md shadow-[#123D32]/10'
                    : 'text-[#65736A] hover:bg-[#F0F5ED] hover:text-[#174B38]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout Box */}
        <div className="mt-auto hidden p-5 lg:block border-t border-[#E8EEE6]">
          <div className="rounded-2xl bg-[#EFF6EA] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#174B38]">👤 {profile?.name || 'Solar Engineer'}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Sign out
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#748078] truncate">{profile?.email || 'Logged in'}</p>
          </div>
          <p className="mt-3 text-center text-[10px] text-[#98A39A]">GRIDPULSE © 2026</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:ml-64 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#39845A]">SOLAR MONITORING</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#183D30] sm:text-3xl">
              {activePage === 'Overview' ? 'Energy Overview' : activePage}
            </h1>
            <p className="mt-1 text-sm text-[#748078]">
              {activePage === 'Overview'
                ? 'Comprehensive solar performance & AI forecasting dashboard.'
                : `Manage your ${activePage.toLowerCase()} workspace.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-[#E3EAE0] bg-white px-4 py-2.5 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[#39845A] animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-[#174B38]">{installation.installation_name}</p>
                <p className="text-[10px] text-[#98A39A]">
                  {installation.latitude.toFixed(4)}° N, {installation.longitude.toFixed(4)}° E
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 lg:hidden"
            >
              Sign out
            </button>
          </div>
        </header>

        {renderPage()}

        <footer className="mt-10 border-t border-[#E4EAE3] pt-5 text-center text-xs text-[#98A39A]">
          GridPulse · Ultra-Short-Term Solar Power Forecasting · Integrated Web Application
        </footer>
      </main>
    </div>
  )
}

export default Dashboard
