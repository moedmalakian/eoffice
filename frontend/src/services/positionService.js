import axiosInstance from '../utils/axiosInstance'

const API_URL = 'position'

/**
 * Fetch all positions
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.search=''] - Search keyword
 * @returns {Promise<Object>} Response from the API
 */
export const fetchPositions = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search = '' } = params

    const queryParams = {}
    if (page !== 1) queryParams.page = page
    if (limit !== 10) queryParams.limit = limit
    if (search.trim() !== '') queryParams.search = search.trim()

    const response = await axiosInstance.get(API_URL, {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    })

    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching positions:', errorMessage)
    throw error
  }
}

/**
 * Fetch position by ID
 *
 * @param {number|string} posId - Position ID
 * @returns {Promise<Object>} Response from the API
 */
export const fetchPositionById = async (posId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${posId}`)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching position details:', errorMessage)
    throw error
  }
}

/**
 * Create position
 *
 * @param {Object} positionData - Data for the new position
 * @returns {Promise<Object>} Response from the API
 */
export const createPosition = async (positionData) => {
  try {
    const response = await axiosInstance.post(API_URL, positionData)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error creating position:', errorMessage)
    throw error
  }
}

/**
 * Update position
 *
 * @param {number|string} posId - Position ID
 * @param {Object} positionData - Updated data for the position
 * @returns {Promise<Object>} Response from the API
 */
export const updatePosition = async (posId, positionData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${posId}`, positionData)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error updating position:', errorMessage)
    throw error
  }
}

/**
 * Delete position
 *
 * @param {number|string} posId - Position ID
 * @returns {Promise<Object>} Response from the API
 */
export const deletePosition = async (posId) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${posId}`)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error deleting position:', errorMessage)
    throw error
  }
}
