import axiosInstance from '../utils/axiosInstance'

const API_URL = 'attendance'

/**
 * Daily
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=31] - Number of items per page
 * @param {string} [params.empId] - Employee ID filter
 * @returns {Promise<Object>} Response from the API
 *
 */
export const fetchAttendances = async (params = {}) => {
  try {
    const { page = 1, limit = 31, empId } = params

    const queryParams = new URLSearchParams()
    if (page !== undefined && page !== null) queryParams.append('page', page)
    if (limit !== undefined && limit !== null) queryParams.append('limit', limit)
    if (empId) queryParams.append('empId', empId)

    let url = `${API_URL}/daily`
    if (queryParams.toString()) url += `?${queryParams.toString()}`

    const response = await axiosInstance.get(url)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching attendances:', errorMessage)
    throw error
  }
}

/**
 * Clock In
 *
 * @param {Object} data - Clock in data
 * @returns {Promise<Object>} Response from the API
 *
 */
export const clockIn = async (data) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/clockIn`, data, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to clock in'
    throw new Error(errorMessage)
  }
}

/**
 * Clock Out
 *
 * @param {number|string} attId - Attendance ID
 * @param {Object} data - Clock out data (location, etc.)
 * @returns {Promise<Object>} Response from the API
 *
 */
export const clockOut = async (attId, data = {}) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/clockOut/${attId}`, data, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to clock out'
    throw new Error(errorMessage)
  }
}

/**
 * Fetch attendance history with dynamic filters
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {number} params.empId - Employee ID filter (optional)
 * @param {number} params.divId - Division ID filter (optional)
 * @param {number} params.posId - Position ID filter (optional)
 * @returns {Promise<Object>} Response from API
 *
 */
export const fetchAttendanceHistory = async (params = {}) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, empId, divId, posId } = params

    const payload = {
      page,
      limit,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(empId && { empId }),
      ...(divId && { divId }),
      ...(posId && { posId }),
    }

    const response = await axiosInstance.post(`${API_URL}/history`, payload)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching attendance history:', errorMessage)
    throw error
  }
}

/**
 * Fetch specific employee attendance history
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Response from API
 *
 */
export const fetchEmployeeAttendanceHistory = async (params = {}) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = params

    const payload = {
      page,
      limit,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }

    const response = await axiosInstance.post(`${API_URL}/history`, payload)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching employee attendance history:', errorMessage)
    throw error
  }
}

/**
 * Correction
 *
 * @param {number|string} attId - Attendance ID
 * @param {Object} data - Correction data
 * @returns {Promise<Object>} Response from the API
 *
 */
export const correctAttendance = async (attId, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/correction/${attId}`, data)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error correcting attendance:', errorMessage)
    throw error
  }
}

/**
 * Search
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.keyword] - Search keyword
 * @param {string} [params.attendanceType] - Attendance type filter
 * @returns {Promise<Object>} Response from the API
 *
 */
export const searchAttendances = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/search`, { params })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error searching attendances:', errorMessage)
    throw error
  }
}
