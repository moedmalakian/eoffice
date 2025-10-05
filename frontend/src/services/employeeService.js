import axiosInstance from '../utils/axiosInstance'

const API_URL = 'employee'

/**
 * Fetch all employees
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.search=''] - Search keyword
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchEmployees = async (params = {}) => {
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
    console.error('Error fetching employees:', errorMessage)
    throw error
  }
}

/**
 * Fetch employee by ID
 *
 * @param {number|string} empId - Employee ID
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const fetchEmployeeById = async (empId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${empId}`)

    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error fetching employee details:', errorMessage)
    throw error
  }
}

/**
 * Create employee
 *
 * @param {Object} employeeData - Data for the new employee
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const createEmployee = async (employeeData) => {
  try {
    const response = await axiosInstance.post(API_URL, employeeData)
    return response.data
  } catch (error) {
    console.error('Error creating employee:', error)
    throw error
  }
}

/**
 * Update employee
 *
 * @param {number|string} empId - Employee ID
 * @param {Object} employeeData - Updated data for the employee
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const updateEmployee = async (empId, employeeData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${empId}`, employeeData)
    return response.data
  } catch (error) {
    console.error('Error updating employee:', error)
    throw error
  }
}

/**
 * Delete employee
 *
 * @param {number|string} empId - Employee ID
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const deleteEmployee = async (empId) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${empId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting employee:', error)
    throw error
  }
}

/**
 * Search employee
 *
 * @param {string} keyword - The search keyword
 * @returns {Promise<Object>} Response from the API
 *
 **/
export const searchEmployee = async (keyword) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/search`, {
      params: { keyword },
    })

    if (response.data?.success && response.data?.data) {
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      }
    } else {
      console.error('InvalempId data format from API:', response.data)
      return {
        success: false,
        message: 'InvalempId data format received from API',
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    console.error('Error searching employee:', errorMessage)
    throw error
  }
}
