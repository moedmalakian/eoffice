import axiosInstance from './axiosInstance'

/**
 * Reusable fetch function for paginated + searchable API
 *
 * @param {string} endpoint - endpoint path (e.g., 'division')
 * @param {number} page - current page
 * @param {number} limit - items per page
 * @param {string} search - search keyword (optional)
 * @returns {Promise<{ data: any[], totalItems: number }> }
 */
export const fetchWithPagination = async (endpoint, page = 1, limit = 10, search = '') => {
  try {
    const response = await axiosInstance.get(endpoint, {
      params: {
        page,
        limit,
        search,
      },
    })

    const { data, totalItems } = response.data
    return { data, totalItems }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw error
  }
}
