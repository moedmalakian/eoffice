import axiosInstance from '../utils/axiosInstance'

const API_URL = 'object'

/**
 * Fetch menu objects
 *
 * @returns {Promise<Array>} Array of menu objects
 *
 **/
export const fetchMenuObjects = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/menu`)
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching menu objects:', error)
    throw error
  }
}

/**
 * Fetch all objects
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.search=''] - Search keyword
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchObjects = async (params = {}) => {
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
    console.error('Error fetching objects:', error)
    throw error
  }
}

/**
 * Reorder object
 *
 * @param {Array<{ objId: number, order: number }>} orders
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const reorderObject = async (orders) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/reorder`, {
      orders,
    })
    return response.data
  } catch (error) {
    console.error('Error reordering objects:', error)
    throw error
  }
}

/**
 * Fetch object by ID
 *
 * @param {number|string} objId - Object ID
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchObjectById = async (objId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${objId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching object details:', error)
    throw error
  }
}

/**
 * Get parent object
 *
 * @param {string} [search=''] - Optional search keyword
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const getParentObject = async (search = '') => {
  try {
    const response = await axiosInstance.get(`${API_URL}/parent`, {
      params: {
        ...(search && { search }),
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching parent objects:', error)
    throw error
  }
}

/**
 * Create object
 *
 * @param {Object} objectData - Data for the new object
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const createObject = async (objectData) => {
  try {
    const response = await axiosInstance.post(API_URL, objectData)
    return response.data
  } catch (error) {
    console.error('Error creating object:', error)
    throw error
  }
}

/**
 * Update object
 *
 * @param {number|string} objId - Object ID
 * @param {Object} objectData - Updated data for the object
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const updateObject = async (objId, objectData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${objId}`, objectData)
    return response.data
  } catch (error) {
    console.error('Error updating object:', error)
    throw error
  }
}

/**
 * Delete object
 *
 * @param {number|string} objId - Object ID
 * @returns {Promise<voobjId>} Response from the API
 *
 **/
export const deleteObject = async (objId) => {
  try {
    await axiosInstance.delete(`${API_URL}/${objId}`)
  } catch (error) {
    console.error('Error deleting object:', error)
    throw error
  }
}

/**
 * Copy object
 *
 * @param {number|string} objId - Object ID to copy
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const copyObject = async (objId) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/${objId}/copy`)
    return response.data
  } catch (error) {
    console.error('Error copying object:', error)
    throw error
  }
}
