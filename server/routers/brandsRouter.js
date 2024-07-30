const { Router } = require('express');
const { brandController } = require('../controllers/brandController');

const brandRouter = Router();

brandRouter.get('/', brandController.getAllBrands);
brandRouter.get('/:id', brandController.getBrandById);

brandRouter.put('/:id/threshold', brandController.updateBrandThresholdById);

module.exports = { brandRouter };