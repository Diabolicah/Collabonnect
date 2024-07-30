const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const paragraphController = {
    // GET /api/collaboration/:id/paragraphs
    async getCollaborationParagraphs(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, newTitle, oldTitle, status, newText, oldText, image, video FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraphId WHERE collaborationId = ?`, [req.params.id]);
            return res.status(200).json(paragraphs);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/paragraphs/:paragraphId
    async getCollaborationParagraphById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, newTitle, oldTitle, status, newText, oldText, image, video FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraphId WHERE collaborationId = ? and paragraphId = ?`, [req.params.id, req.params.paragraphId]);
            if (paragraphs.length === 0) {
                return res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            return res.status(200).json(paragraphs[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/paragraphs/images
    async getCollaborationParagraphImages(req, res) {
        const fs = require('fs');
        const path = require('path');
        const directoryPath = path.join(__dirname, '../public/collaborationParagraphImages');
        const files = fs.readdirSync(directoryPath);
        return res.status(200).json(files);
    },
    // GET /api/collaboration/paragraphs/videos
    async getCollaborationParagraphVideos(req, res) {
        const videoLinks = ["https://www.youtube.com/embed/YwJotfRP1MI", "https://www.youtube.com/embed/1MIb7RkePSk"]
        return res.status(200).json(videoLinks);
    },
    // POST /api/collaboration/:id/paragraphs
    async createCollaborationParagraph(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX} (newTitle, oldTitle, status, newText, oldText, image, video) VALUES (?, "", "up to date", "", "", "")`);
           if(paragraphs.affectedRows != 0){
            const [rows] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_paragraph (collaborationId, paragraphId) VALUES (?, ?)`, [req.params.id, paragraphs.insertId]);
            return res.status(201).json({ message: `Paragraph with id ${paragraphs.insertId} for collaboration id ${rows.insertId} created` });
           }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/paragraphs/:paragraphId
    async updateCollaborationParagraph(req, res) {
        const { newTitle, oldTitle, status, newText, oldText, image, video } = req.body;
        if (!newTitle || !oldTitle || !status || !newText || !oldText) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["title", "status", "text"]
            });
        }
        console.log(req.body);
        const connection = await dbConnection.createConnection();
        try {
            const [paragraphs] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_paragraph SET newTitle = ?, oldTitle = ?, status = ?, newText = ?, oldText = ?, image = ?, video = ? WHERE id = ?`, [newTitle, oldTitle, status, newText, oldText, image, video, req.params.paragraphId]);
            if (paragraphs.affectedRows === 0) {
                return res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} updated` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // DELETE /api/collaboration/:id/paragraphs/:paragraphId
    async deleteCollaborationParagraph(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_paragraph WHERE id = ?`, [req.params.paragraphId]);
            if (paragraphs.affectedRows === 0) {
                return res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} deleted` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    }
}

module.exports = { paragraphController };