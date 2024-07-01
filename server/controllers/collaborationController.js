const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const collaborationController = {
    // GET /api/collaboration
    async getCollaborations(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration`);
            res.status(200).json(collaborations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id
    async getCollaborationById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration WHERE id = ?`, [req.params.id]);
            if (collaborations.length === 0) {
                res.status(404).json({ message: `Collaboration with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(collaborations[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/paragraphs
    async getCollaborationParagraphs(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, title, status, text, image, video FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraph_id WHERE collaboration_id = ?`, [req.params.id]);
            res.status(200).json(paragraphs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/paragraphs/:paragraphId
    async getCollaborationParagraphById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, title, status, text, image, video FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraph_id WHERE collaboration_id = ? and paragraph_id = ?`, [req.params.id, req.params.paragraphId]);
            if (paragraphs.length === 0) {
                res.status(404).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(paragraphs[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/logs
    async getCollaborationLogs(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [logs] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration_logs WHERE collaboration_id = ?`, [req.params.id]);
            res.status(200).json(logs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        } finally {
            connection.end();
        }
    },
    // POST /api/collaboration
    async createCollaboration(req, res) {},
    // POST /api/collaboration/:id/paragraphs
    async createCollaborationParagraph(req, res) {},
    // PUT /api/collaboration/:id
    async updateCollaboration(req, res) {},
    // PUT /api/collaboration/:id/paragraphs/:paragraphId
    async updateCollaborationParagraph(req, res) {},
    // DELETE /api/collaboration/:id
    async deleteCollaboration(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_collaboration WHERE id = ?`, [req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ message: `Collaboration with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json({ message: `Collaboration with id ${req.params.id} deleted` });
        } catch (error) {
            res.status(500).json({ message: error.message });
        } finally {
            connection.end();
        }
    },
    // DELETE /api/collaboration/:id/paragraphs/:paragraphId
    async deleteCollaborationParagraph(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph WHERE collaboration_id = ? and paragraph_id = ?`, [req.params.id, req.params.paragraphId]);
            if (paragraphs.affectedRows === 0) {
                res.status(404).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
                return;
            }
            res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} deleted` });
        } catch (error) {
            res.status(500).json({ message: error.message });
        } finally {
            connection.end();
        }
    }
};

module.exports = { collaborationController };