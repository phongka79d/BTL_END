const addressService = require('../services/address.service');
const { errorResponse, successResponse } = require('../utils/response');

const createAddressController = (service = addressService) => {
  const respond = (action, message) => async (req, res, next) => {
    try {
      const items = await action(req);
      return successResponse(res, 200, message, { items });
    } catch (error) {
      const statusCode = error && (error.statusCode || error.status);
      if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599) {
        return errorResponse(res, statusCode, error.message, error.errors);
      }
      return next(error);
    }
  };

  return {
    getProvinces: respond(() => service.listProvinces(), 'Lấy danh sách tỉnh/thành phố thành công'),
    getWards: respond((req) => service.listWards(req.query && req.query.provinceCode), 'Lấy danh sách phường/xã thành công')
  };
};

const controller = createAddressController();

module.exports = {
  ...controller,
  createAddressController
};