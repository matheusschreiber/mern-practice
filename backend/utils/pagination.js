/**
 * Calculates the skip and limit parameters for database pagination.
 * 
 * @param {number} page - The current page number (starts at 1)
 * @param {number} limit - The number of items per page
 * @returns {Object} { skip, limit }
 */
const getPagination = (page = 1, limit = 10) => {
  // Calculate how many items to skip
  const skip = (page + 1) * limit;

  return { skip, limit };
};

module.exports = { getPagination };
