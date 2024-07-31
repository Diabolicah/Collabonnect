const {dbConnection} = require('../db_connection');
const rs = require('readability-score');

const TABLE_NAME_PREFIX = "tbl_112"

function checkParagraphReadability(title, text) {
    const titleReadability = rs.fleschReadingEase(title);
    const textReadability = rs.fleschReadingEase(text);
    return Math.round((titleReadability + textReadability) / 2);
}

const paragraphController = {
    // GET /api/collaboration/:id/paragraphs
    async getCollaborationParagraphs(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraphId WHERE collaborationId = ?`, [req.params.id]);
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
            const [paragraphs] = await connection.execute(`SELECT id, newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraphId WHERE collaborationId = ? and paragraphId = ?`, [req.params.id, req.params.paragraphId]);
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
        const { paragraphType } = req.body;
        const paragraphTypesJson = require('../Data/paragraphTypes.json');

        if (!paragraphType || Object.keys(paragraphTypesJson).includes(paragraphType) === false) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["paragraphType"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_paragraph (newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo, readability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, ["", "", "Up to date", "", "", "", paragraphTypesJson[paragraphType].oldImage, "", paragraphTypesJson[paragraphType].oldVideo, "0"]);
           if(paragraphs.affectedRows === 0){
                return res.status(404).json({ error: `Couldn't create paragraph for collaboration id ${req.params.id}` });
           }
           const [rows] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_paragraph (collaborationId, paragraphId) VALUES (?, ?)`, [req.params.id, paragraphs.insertId]);
            if(rows.affectedRows === 0) {
                return res.status(404).json({ error: `Couldn't create paragraph for collaboration id ${req.params.id}` });
            }
           const [paragraph] = await connection.execute(`SELECT id, newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo FROM ${TABLE_NAME_PREFIX}_paragraph WHERE id = ?`, [paragraphs.insertId]);
           if(paragraph.length === 0){
                return res.status(404).json({ error: `Couldn't create paragraph for collaboration id ${req.params.id}` });
           }
           return res.status(201).json({ message: `Paragraph with id ${paragraphs.insertId} for collaboration id ${rows.insertId} created`, paragraph: paragraph });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },

    // PUT /api/collaboration/:id/paragraphs
    async updateCollaborationParagraphs(req, res) {
        const { paragraphs, userId } = req.body;
        if (!paragraphs || !userId || paragraphs.length === 0) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["paragraphs", "userId"]
            });
        }
        const connection = await dbConnection.createConnection();
        try {
            let sum = 0;
            paragraphs.forEach(async (paragraph) => {
                const { newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo } = paragraph;
                if (!status || !paragraph.id) {
                    return res.status(400).json({
                        error: "All fields are required",
                        fields: ["status", "id"]
                    });
                }
                let paragraphReadability = checkParagraphReadability(newTitle, newText);
                sum += paragraphReadability < 0 ? 0 : paragraphReadability;

                const [paragraphs] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_paragraph SET newTitle = ?, oldTitle = ?, status = ?, newText = ?, oldText = ?, newImage = ?, oldImage = ?, newVideo = ?, oldVideo = ? WHERE id = ?`, [newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo, paragraph.id]);
                if (paragraphs.affectedRows === 0) {
                    return res.status(404).json({ error: `Paragraph with id ${paragraph.id} for collaboration id ${req.params.id} not found` });
                }
            });

            const avg = Math.round(sum / paragraphs.length);
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET aiReadability = ? WHERE id = ?`, [avg, req.params.id]);
            if (collaborations.affectedRows === 0) {
                return res.status(404).json({ error: `Couldn't update ai readability for Collaboration with id ${req.params.id}, Collaboration not found` });
            }

            const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const [editLog] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration_logs WHERE date = ?`, [date]);
            if (editLog.length === 0) {
                return res.status(409).json({ error: `Edit log for collaboration id ${req.params.id} already exists` });
            }
            const [editLogs] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_logs (userId, collaborationId, date) VALUES (?, ?, ?)`, [userId, req.params.id, date]);
            if (editLogs.affectedRows === 0) {
                return res.status(404).json({ error: `Couldn't create log for collaboration id ${req.params.id}` });
            }
            return res.status(200).json({ message: `Paragraphs for collaboration id ${req.params.id} updated`});
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/paragraphs/:paragraphId
    async updateCollaborationParagraph(req, res) {
        const { newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo } = req.body;
        if (!status) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["status"]
            });
        }

        let paragraphReadability = checkParagraphReadability(newTitle, newText);
        paragraphReadability = paragraphReadability < 0 ? 0 : paragraphReadability;

        const connection = await dbConnection.createConnection();
        try {
            const [paragraphs] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_paragraph SET newTitle = ?, oldTitle = ?, status = ?, newText = ?, oldText = ?, newImage = ?, oldImage = ?, newVideo = ?, oldVideo = ?, readability = ? WHERE id = ?`, [newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo, paragraphReadability, req.params.paragraphId]);
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