const { Router } = require('express');
const { collaborationController } = require('../controllers/collaborationController');
const { paragraphController } = require('../controllers/paragraphController');

const collaborationRouter = Router();

collaborationRouter.get('/', collaborationController.getCollaborations);
collaborationRouter.get('/:id', collaborationController.getCollaborationById);
collaborationRouter.get('/paragraphs/images', paragraphController.getCollaborationParagraphImages);
collaborationRouter.get('/paragraphs/videos', paragraphController.getCollaborationParagraphVideos);
collaborationRouter.get('/:id/paragraphs', paragraphController.getCollaborationParagraphs);
collaborationRouter.get('/:id/paragraphs/:paragraphId', paragraphController.getCollaborationParagraphById);
collaborationRouter.get('/:id/logs', collaborationController.getCollaborationLogs);
collaborationRouter.get('/:id/coWritersImages', collaborationController.getCollaborationCoWritersProfileImages);

collaborationRouter.post('/', collaborationController.createCollaboration);
collaborationRouter.post('/:id/paragraphs', paragraphController.createCollaborationParagraph);
collaborationRouter.post('/:id/coWriters/:coWriterId', collaborationController.addCollaborationCoWriter);

collaborationRouter.put('/:id/status', collaborationController.updateCollaborationStatus);
collaborationRouter.put('/:id/upvote', collaborationController.updateCollaborationUpvote);
collaborationRouter.put('/:id/downvote', collaborationController.updateCollaborationDownvote);
collaborationRouter.put('/:id/readability', collaborationController.updateCollaborationReadability);
collaborationRouter.put('/:id/paragraphs', paragraphController.updateCollaborationParagraphs);
collaborationRouter.put('/:id/paragraphs/:paragraphId', paragraphController.updateCollaborationParagraph);

collaborationRouter.delete('/:id', collaborationController.deleteCollaboration);
collaborationRouter.delete('/:id/paragraphs/:paragraphId', paragraphController.deleteCollaborationParagraph);

module.exports = { collaborationRouter };