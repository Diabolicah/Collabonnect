const { Router } = require('express');
const { developerController } = require('../controllers/developerController');

const developerRouter = Router();

developerRouter.get('/', developerController.getAllDevelopers);
developerRouter.get('/:id', developerController.getDeveloperById);

module.exports = { developerRouter };