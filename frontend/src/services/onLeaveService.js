import axiosInstance from '../utils/axiosInstance'

const API_URL = 'onLeave'

export const fetchLeaveRequests = async (params = {}) => {
  const { page = 1, limit = 10, search = '' } = params
  const queryParams = {}
  if (page !== 1) queryParams.page = page
  if (limit !== 10) queryParams.limit = limit
  if (search.trim() !== '') queryParams.search = search.trim()

  const response = await axiosInstance.get(API_URL, {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  })
  return response.data
}

export const fetchLeaveRequestById = async (onlId) => {
  const response = await axiosInstance.get(`${API_URL}/${onlId}`)
  return response.data
}

export const createLeaveRequest = async (payload) => {
  const response = await axiosInstance.post(API_URL, payload)
  return response.data
}

export const updateLeaveRequest = async (onlId, payload) => {
  const response = await axiosInstance.put(`${API_URL}/${onlId}`, payload)
  return response.data
}

export const deleteLeaveRequest = async (onlId) => {
  const response = await axiosInstance.delete(`${API_URL}/${onlId}`)
  return response.data
}
