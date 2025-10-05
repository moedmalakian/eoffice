import axiosInstance from '../utils/axiosInstance'

const API_URL = 'user'

/**
 * Fetch all users
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.search=''] - Search keyword
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchUsers = async (params = {}) => {
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
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Fetch user by ID
 *
 * @param {number|string} useId - User ID
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchUserById = async (useId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${useId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user details:', error)
    throw error
  }
}

/**
 * Create user
 *
 * @param {Object} userData - Data for the new user
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post(API_URL, userData)
    return response.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update user
 *
 * @param {number|string} useId - User ID
 * @param {Object} userData - Updated data for the user
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const updateUser = async (useId, userData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${useId}`, userData)
    return response.data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Delete user
 *
 * @param {number|string} useId - User ID
 * @returns {Promise<void>} Response from the API
 *
 **/
export const deleteUser = async (useId) => {
  try {
    await axiosInstance.delete(`${API_URL}/${useId}`)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
