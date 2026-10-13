/**
 * Standard API response helpers
 */

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * sendPaginated - two call signatures:
 *   1) sendPaginated(res, items, total, page, limit, message)  <- memoryStorage style
 *   2) sendPaginated(res, items, paginationObject, message)    <- controller style
 */
const sendPaginated = (res, data, totalOrPagination, pageOrMsg, limitOrUndef, messageOrUndef) => {
  let pagination;
  let message = 'Success';

  if (typeof totalOrPagination === 'number') {
    // Signature 1: (res, data, total, page, limit, message)
    const total = totalOrPagination;
    const page = pageOrMsg || 1;
    const limit = limitOrUndef || 10;
    message = messageOrUndef || 'Success';
    const totalPages = Math.ceil(total / limit);
    pagination = {
      totalItems: total,
      currentPage: page,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } else {
    // Signature 2: (res, data, paginationObject, message)
    pagination = totalOrPagination || {};
    message = pageOrMsg || 'Success';
  }

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
