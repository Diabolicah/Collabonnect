const { Router } = require('express');
const { collaborationController } = require('../controllers/collaborationController');

const collaborationRouter = Router();

collaborationRouter.get('/', collaborationController.getCollaborations);
collaborationRouter.get('/:id', collaborationController.getCollaborationById);
collaborationRouter.post('/', collaborationController.createCollaboration);
collaborationRouter.put('/:id', collaborationController.updateCollaboration);
collaborationRouter.delete('/:id', collaborationController.deleteCollaboration);

module.exports = { collaborationRouter };