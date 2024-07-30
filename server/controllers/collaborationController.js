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