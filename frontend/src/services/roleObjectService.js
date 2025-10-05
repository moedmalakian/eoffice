import axiosInstance from '../utils/axiosInstance'

const API_URL = 'roleObject'

export const fetchObjects = async () => {
  try {
    const response = await axiosInstance.get(`/${API_URL}/objects`)
    if (response.status === 200 && response.data) {
      return response.data.data || []
    } else {
      console.warn('API returned unexpected status or data:', response.status)
      return []
    }
  } catch (error) {
    console.error('Error fetching objects:', error)
    throw new Error('Failed to fetch objects')
  }
}

export const fetchRoleAccess = async (rolId) => {
  try {
    const response = await axiosInstance.get(`/${API_URL}/${rolId}`)

    if (response.status === 200 && response.data && response.data.data) {
      const selectedObjects = response.data.data.selectedObjects || []
      return selectedObjects
    } else {
      console.warn('Invalid data format for role access or no access assigned')
      return []
    }
  } catch (error) {
    console.error('Error fetching role access:', error)
    throw new Error('Failed to fetch role access')
  }
}

export const createRoleAccess = async (rolId, selectedObjects) => {
  try {
    const payload = {
      rolId,
      selectedObjects,
    }

    const response = await axiosInstance.post(`/${API_URL}`, payload)

    if (response.status === 200 && response.data) {
      return response.data
    } else {
      console.warn('Unexpected response status:', response.status)
      return null
    }
  } catch (error) {
    console.error('Error saving role access:', error)
    throw new Error('Failed to save role access')
  }
}
