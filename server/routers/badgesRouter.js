const { Router } = require('express');
const { badgeController } = require('../controllers/badgeController');

const badgeRouter = Router();

badgeRouter.get('/', badgeController.getBadges);
badgeRouter.get('/images', badgeController.getBadgeImages);
badgeRouter.get('/:id', badgeController.getBadgeById);

badgeRouter.post('/', badgeController.createBadge);

badgeRouter.delete('/:id', badgeController.deleteBadgeById);

module.exports = { badgeRouter };