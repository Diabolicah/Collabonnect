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
                return;
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
            const [paragraphs] = await connection.execute(`SELECT id, title, status, text, image, video FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraph_id WHERE collaboration_id = ?`, [req.params.id]);
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
            const [paragraphs] = await connection.execute(`SELECT id, title, status, text, image, video FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraph_id WHERE collaboration_id = ? and paragraph_id = ?`, [req.params.id, req.params.paragraphId]);
            if (paragraphs.length === 0) {
                res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
                return;
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
            const [logs] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration_logs WHERE collaboration_id = ?`, [req.params.id]);
            res.status(200).json(logs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // POST /api/collaboration
    async createCollaboration(req, res) {
        const { user_id, title, developer_id, brand_id } = req.body;
        if (!user_id || !title || !developer_id || !brand_id) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["user_id", "title", "developer_id", "brand_id"]
            });
            return;
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration (writer_id, title, developer_id, brand_id, upvote, downvote, status, ai_readability) VALUES (?, ?, ?, ?, 0, 0, "pending", 0)`, [user_id, title, developer_id, brand_id]);
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
            const [paragraphs] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_paragraph (collaboration_id, title, status, text, image, video) VALUES (?, "", "up to date", "", "", "")`, [req.params.id]);
            res.status(201).json({ message: `Paragraph with id ${paragraphs.insertId} for collaboration id ${req.params.id} created` });
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
            return;
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET status = ? WHERE id = ?`, [status, req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
                return;
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
            return;
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET upvote = upvote + ? WHERE id = ?`, [amount, req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
                return;
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
            return;
        }
        
        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET downvote = downvote + ? WHERE id = ?`, [amount, req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
                return;
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
            return;
        }

        const connection = await dbConnection.createConnection();
        
        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET ai_readability = ? WHERE id = ?`, [readability, req.params.id]);
            if (collaborations.affectedRows === 0) {
                res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
                return;
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
        const { title, status, text, image, video } = req.body;
        if (!title || !status || !text || !image || !video) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["title", "status", "text", "image", "video"]
            });
            return;
        }

        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration_paragraph SET title = ? status = ? text = ? image = ? video = ?  WHERE collaboration_id = ? and paragraph_id = ?`, [title, status, text, image, video, req.params.id, req.params.paragraphId]);
            if (paragraphs.affectedRows === 0) {
                res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
                return;
            }
            res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} updated` });
        } catch (error) {
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
                return;
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
            const [paragraphs] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph WHERE collaboration_id = ? and paragraph_id = ?`, [req.params.id, req.params.paragraphId]);
            if (paragraphs.affectedRows === 0) {
                res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
                return;
            }
            res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} deleted` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    }
};

module.exports = { collaborationController };