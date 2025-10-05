import axiosInstance from '../utils/axiosInstance'

const API_URL = 'role'

/**
 * Fetch all roles
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.search=''] - Search keyword
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchRoles = async (params = {}) => {
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
    console.error('Error fetching roles:', error)
    throw error
  }
}

/**
 * Fetch role by ID
 *
 * @param {number|string} rolId - Role ID
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchRoleById = async (rolId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${rolId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching role details:', error)
    throw error
  }
}

/**
 * Create role
 *
 * @param {Object} roleData - Data for the new role
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const createRole = async (roleData) => {
  try {
    const response = await axiosInstance.post(API_URL, roleData)
    return response.data
  } catch (error) {
    console.error('Error creating role:', error)
    throw error
  }
}

/**
 * Update role
 *
 * @param {number|string} rolId - Role ID
 * @param {Object} roleData - Updated data for the role
 * @returns {Promise<Object>} Response from the API
 */
export const updateRole = async (rolId, roleData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${rolId}`, roleData)
    return response.data
  } catch (error) {
    console.error('Error updating role:', error)
    throw error
  }
}

/**
 * Delete role
 *
 * @param {number|string} rolId - Role ID
 * @returns {Promise<void>} Response from the API
 *
 **/
export const deleteRole = async (rolId) => {
  try {
    await axiosInstance.delete(`${API_URL}/${rolId}`)
  } catch (error) {
    console.error('Error deleting role:', error)
    throw error
  }
}
