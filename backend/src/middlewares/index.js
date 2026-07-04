const { protect } = require('./auth.middleware');
const { admin } = require('./admin.middleware');
const { validateBody } = require('./validation.middleware');
const errorMiddleware = require('./error.middleware');

module.exports = {
  protect,
  admin,
  validateBody,
  errorMiddleware
};
