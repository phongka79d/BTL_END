const express = require('express');
const addressController = require('../controllers/address.controller');

const router = express.Router();

router.get('/provinces', addressController.getProvinces);
router.get('/wards', addressController.getWards);

module.exports = router;