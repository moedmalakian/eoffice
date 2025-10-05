import axiosInstance from '../utils/axiosInstance'

const API_URL = 'reference'

/**
 * Fetch all references (header + details)
 */
export const fetchReferences = async (params = {}) => {
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
    console.error('Error fetching references:', errorMessage)
    throw error
  }
}

/**
 * Fetch reference by ID
 */
export const fetchReferenceById = async (rfhId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${rfhId}`)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching reference:', errorMessage)
    throw error
  }
}

/**
 * Fetch reference by code
 */
export const fetchReferenceByCode = async (referenceCode) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/code/${referenceCode}`)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching reference:', errorMessage)
    throw error
  }
}

/**
 * Fetch reference list
 */
export const fetchReferenceList = async (codes = []) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/referenceList`, {
      referenceCode: codes,
    })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching reference list:', errorMessage)
    throw error
  }
}

/**
 * Create reference (header + details)
 */
export const createReference = async (referenceData) => {
  try {
    const response = await axiosInstance.post(API_URL, referenceData)
    return response.data
  } catch (error) {
    console.error('Error creating reference:', error)
    throw error
  }
}

/**
 * Update reference (header + details)
 */
export const updateReference = async (rfhId, referenceData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${rfhId}`, referenceData)
    return response.data
  } catch (error) {
    console.error('Error updating reference:', error)
    throw error
  }
}

/**
 * Delete reference (header + all details)
 */
export const deleteReference = async (rfhId) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${rfhId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting reference:', error)
    throw error
  }
}
