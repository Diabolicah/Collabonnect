const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const collaborationController = {
    // GET /api/collaboration
    async getCollaborations(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration`);
            res.status(201).json(collaborations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id
    async getCollaborationById(req, res) {},
    // GET /api/collaboration/:id/paragraphs
    async getCollaborationParagraphs(req, res) {},
    // GET /api/collaboration/:id/paragraphs/:paragraphId
    async getCollaborationParagraphById(req, res) {},
    // GET /api/collaboration/:id/logs
    async getCollaborationLogs(req, res) {},
    // POST /api/collaboration
    async createCollaboration(req, res) {},
    // POST /api/collaboration/:id/paragraphs
    async createCollaborationParagraph(req, res) {},
    // PUT /api/collaboration/:id
    async updateCollaboration(req, res) {},
    // PUT /api/collaboration/:id/paragraphs/:paragraphId
    async updateCollaborationParagraph(req, res) {},
    // DELETE /api/collaboration/:id
    async deleteCollaboration(req, res) {},
    // DELETE /api/collaboration/:id/paragraphs/:paragraphId
    async deleteCollaborationParagraph(req, res) {}
};

module.exports = { collaborationController };