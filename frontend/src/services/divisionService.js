import axiosInstance from '../utils/axiosInstance'

const API_URL = 'division'

/**
 * Fetch all divisions
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.search=''] - Search keyword
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchDivisions = async (params = {}) => {
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
    console.error('Error fetching divisions:', errorMessage)
    throw error
  }
}

/**
 *
 * Fetch division by ID
 * @param {number|string} divId - Division ID
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchDivisionById = async (divId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${divId}`)

    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching division details:', errorMessage)
    throw error
  }
}

/**
 * Create division
 *
 * @param {Object} divisionData - Data for the new division
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const createDivision = async (divisionData) => {
  try {
    const response = await axiosInstance.post(API_URL, divisionData)
    return response.data
  } catch (error) {
    console.error('Error creating division:', error)
    throw error
  }
}

/**
 * Update division
 *
 * @param {number|string} divId - Division ID
 * @param {Object} divisionData - Updated data for the division
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const updateDivision = async (divId, divisionData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${divId}`, divisionData)
    return response.data
  } catch (error) {
    console.error('Error updating division:', error)
    throw error
  }
}

/**
 * Delete division
 *
 * @param {number|string} divId - Division ID
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const deleteDivision = async (divId) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${divId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting division:', error)
    throw error
  }
}
