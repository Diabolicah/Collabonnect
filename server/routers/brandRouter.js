const { Router } = require('express');
const { brandController } = require('../controllers/brandController');

const brandRouter = Router();

brandRouter.get('/:id', brandController.getBrandById);

module.exports = { brandRouter };