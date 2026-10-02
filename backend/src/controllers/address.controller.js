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
    getWards: respond((req) => service.listWards(req.query && req.query.provinceCode), 'Lấy danh sách phường/xã thành công'),
    getStreets: respond((req) => service.searchStreets({
      provinceCode: req.query && req.query.provinceCode,
      wardCode: req.query && req.query.wardCode,
      query: req.query && req.query.q
    }), 'Tra cứu đường/phố thành công')
  };
};

const createStreetRateLimiter = ({ limit = 60, windowMs = 60_000, maxClients = 10_000, now = Date.now } = {}) => {
  const clients = new Map();
  const requestLimit = Number.isInteger(limit) && limit > 0 ? limit : 60;
  const intervalMs = Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000;
  const clientCapacity = Number.isInteger(maxClients) && maxClients > 0 ? maxClients : 10_000;

  return (req, res, next) => {
    const currentTime = now();
    const clientKey = (typeof req.ip === 'string' && req.ip) || (req.socket && req.socket.remoteAddress) || 'unknown';
    let entry = clients.get(clientKey);
    if (entry && currentTime - entry.windowStart >= intervalMs) {
      clients.delete(clientKey);
      entry = undefined;
    }

    if (!entry) {
      if (clients.size >= clientCapacity) {
        for (const [key, client] of clients) {
          if (currentTime - client.windowStart >= intervalMs) clients.delete(key);
        }
        while (clients.size >= clientCapacity) clients.delete(clients.keys().next().value);
      }
      entry = { count: 0, windowStart: currentTime };
    } else {
      clients.delete(clientKey);
    }

    entry.count += 1;
    clients.set(clientKey, entry);
    if (entry.count > requestLimit) {
      const retryAfter = Math.max(1, Math.ceil((intervalMs - (currentTime - entry.windowStart)) / 1000));
      res.set('Retry-After', String(retryAfter));
      return errorResponse(res, 429, 'Quá nhiều yêu cầu tra cứu địa chỉ. Vui lòng thử lại sau.');
    }
    return next();
  };
};

const controller = createAddressController();

module.exports = {
  ...controller,
  createAddressController,
  createStreetRateLimiter
};