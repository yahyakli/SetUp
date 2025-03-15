/**
 * Utility class for consistent API responses
 */
export class ResponseHandler {
  /**
   * Send success response
   * 
   * @param {object} res - Express response object
   * @param {string} message - Success message
   * @param {object|array} data - Response data
   * @param {number} statusCode - HTTP status code
   * @returns {object} Response object
   */
  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send error response
   * 
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {object} errors - Validation errors
   * @returns {object} Response object
   */
  static error(res, message, statusCode = 400, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }
}