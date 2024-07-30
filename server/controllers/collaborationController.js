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
            res.status(500).json({ error: error.message });
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
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            res.status(200).json(collaborations[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/paragraphs
    async getCollaborationParagraphs(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, title, status, text, image, video FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraphId WHERE collaborationId = ?`, [req.params.id]);
            res.status(200).json(paragraphs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/paragraphs/:paragraphId
    async getCollaborationParagraphById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, title, status, text, image, video FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraphId WHERE collaborationId = ? and paragraphId = ?`, [req.params.id, req.params.paragraphId]);
            if (paragraphs.length === 0) {
                res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            res.status(200).json(paragraphs[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/logs
    async getCollaborationLogs(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [logs] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration_logs WHERE collaborationId = ?`, [req.params.id]);
            res.status(200).json(logs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/co_writers
    async getCollaborationCoWritersProfileImages(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [coWriters] = await connection.execute(`SELECT profileImage FROM ${TABLE_NAME_PREFIX}_collaboration_cowriter inner join ${TABLE_NAME_PREFIX}_user on ${TABLE_NAME_PREFIX}_user.id = ${TABLE_NAME_PREFIX}_collaboration_cowriter.userId WHERE collaborationId = ?`, [req.params.id]);
            res.status(200).json(coWriters);
        } catch (error) {
            res.status(500).json({ error: error.message });
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
        res.status(200).json(files);
    },
    // GET /api/collaboration/paragraphs/videos
    async getCollaborationParagraphVideos(req, res) {
        const videoLinks = ["https://www.youtube.com/embed/YwJotfRP1MI", "https://www.youtube.com/embed/1MIb7RkePSk"]
        res.status(200).json(videoLinks);
    },
    // POST /api/collaboration
    async createCollaboration(req, res) {
        const { userId, title, description, developerId, brand_id } = req.body;
        if (!userId || !title || !developerId || !brandId || !description) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["userId", "title", "developerId", "brandId", "description"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration (writerId, title, description, developerId, brandId, upvote, downvote, status, aiReadability) VALUES (?, ?, ?, ?, ?, 0, 0, "pending", 0)`, [userId, title, description, developerId, brandId]);
            res.status(201).json({ message: `Collaboration with id ${collaborations.insertId} created` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // POST /api/collaboration/:id/paragraphs
    async createCollaborationParagraph(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_paragraph (collaborationId, title, status, text, image, video) VALUES (?, "", "up to date", "", "", "")`, [req.params.id]);
            res.status(201).json({ message: `Paragraph with id ${paragraphs.insertId} for collaboration id ${req.params.id} created` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // POST /api/collaboration/:id/co_writers/:coWriterId
    async addCollaborationCoWriter(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [coWriters] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_cowriter (collaborationId, coWriterId) VALUES (?, ?)`, [req.params.id, req.params.coWriterId]);
            res.status(201).json({ message: `Co-writer with id ${req.params.coWriterId} for collaboration id ${req.params.id} created` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/status
    async updateCollaborationStatus(req, res) {
        const { status } = req.body;
        if (!status) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["status"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET status = ? WHERE id = ?`, [status, req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            res.status(200).json({ message: `Collaboration with id ${req.params.id} updated` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/upvote
    async updateCollaborationUpvote(req, res) {
        const { amount } = req.body;
        if (!amount) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["amount"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET upvote = upvote + ? WHERE id = ?`, [amount, req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            res.status(200).json({ message: `Collaboration with id ${req.params.id} updated` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/downvote
    async updateCollaborationDownvote(req, res) {
        const { amount } = req.body;
        if (!amount) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["amount"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET downvote = downvote + ? WHERE id = ?`, [amount, req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            res.status(200).json({ message: `Collaboration with id ${req.params.id} updated` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/readability
    async updateCollaborationReadability(req, res) {
        const { readability } = req.body;
        if (!readability) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["readability"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET aiReadability = ? WHERE id = ?`, [readability, req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            res.status(200).json({ message: `Collaboration with id ${req.params.id} updated` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/paragraphs/:paragraphId
    async updateCollaborationParagraph(req, res) {
        console.log(req.body)
        const { title, status, text, image, video } = req.body;
        if (!title || !status || !text) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["title", "status", "text"]
            });
        }

        const connection = await dbConnection.createConnection();
        try {
            const [paragraphs] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_paragraph SET title = ?, status = ?, text = ? WHERE id = ?`, [title, status, text, req.params.paragraphId]);
            if (paragraphs.affectedRows === 0) {
                res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} updated` });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // DELETE /api/collaboration/:id
    async deleteCollaboration(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_collaboration WHERE id = ?`, [req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            res.status(200).json({ message: `Collaboration with id ${req.params.id} deleted` });
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} deleted` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // DELETE /api/collaboration/:id/coWriters/:coWriterId
    async deleteCollaborationCoWriter(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [coWriters] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_collaboration_cowriter WHERE collaborationId = ? and coWriterId = ?`, [req.params.id, req.params.coWriterId]);
            if (coWriters.affectedRows === 0) {
                res.status(404).json({ error: `Co-writer with id ${req.params.coWriterId} for collaboration id ${req.params.id} not found` });
            }
            res.status(200).json({ message: `Co-writer with id ${req.params.coWriterId} for collaboration id ${req.params.id} deleted` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    }
};

module.exports = { collaborationController };