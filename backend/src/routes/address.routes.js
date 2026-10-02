const express = require('express');
const addressController = require('../controllers/address.controller');

const router = express.Router();
const streetRateLimit = addressController.createStreetRateLimiter();

router.get('/provinces', addressController.getProvinces);
router.get('/wards', addressController.getWards);
router.get('/streets', streetRateLimit, addressController.getStreets);

module.exports = router;