const { Router } = require('express');
const { collaborationController } = require('../controllers/collaborationController');

const collaborationRouter = Router();

collaborationRouter.get('/', collaborationController.getCollaborations);
collaborationRouter.get('/:id', collaborationController.getCollaborationById);
collaborationRouter.get('/:id/paragraphs', collaborationController.getCollaborationParagraphs);
collaborationRouter.get('/:id/paragraphs/:paragraphId', collaborationController.getCollaborationParagraphById);
collaborationRouter.get('/:id/logs', collaborationController.getCollaborationLogs);

collaborationRouter.post('/', collaborationController.createCollaboration);
collaborationRouter.post('/:id/paragraphs', collaborationController.createCollaborationParagraph);

collaborationRouter.put('/:id/status', collaborationController.updateCollaborationStatus);
collaborationRouter.put('/:id/upvote', collaborationController.updateCollaborationUpvote);
collaborationRouter.put('/:id/downvote', collaborationController.updateCollaborationDownvote);
collaborationRouter.put('/:id/readability', collaborationController.updateCollaborationReadability);
collaborationRouter.put('/:id/paragraphs/:paragraphId', collaborationController.updateCollaborationParagraph);

collaborationRouter.delete('/:id', collaborationController.deleteCollaboration);
collaborationRouter.delete('/:id/paragraphs/:paragraphId', collaborationController.deleteCollaborationParagraph);

module.exports = { collaborationRouter };