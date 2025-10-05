/**
 * Generates a paginated SQL query.
 *
 * @param {string} baseQuery - The base SQL query without pagination.
 * @param {number} page - The current page number (default: 1).
 * @param {number} limit - The number of items per page (default: 10).
 * @returns {string} The SQL query with pagination applied.
 *
 **/
const paginate = (baseQuery, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return `${baseQuery} ORDER BY created_date DESC LIMIT ${limit} OFFSET ${offset}`;
};

module.exports = paginate;
