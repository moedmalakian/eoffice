/**
 * Builds a SQL search query clause and its corresponding values.
 *
 * @param {string} search - The search keyword.
 * @param {string[]} columns - The columns to apply the search on.
 * @returns {Object} An object containing the SQL clause and the values.
 *
 **/
const buildSearchQuery = (search, columns = []) => {
  if (!search || columns.length === 0) return { clause: "", values: [] };

  const likeStatements = columns.map((col) => `${col} LIKE ?`).join(" OR ");
  const values = columns.map(() => `%${search}%`);

  return {
    clause: `WHERE ${likeStatements}`,
    values,
  };
};

module.exports = buildSearchQuery;
