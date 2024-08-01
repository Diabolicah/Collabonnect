const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const collaborationController = {
    // GET /api/collaboration
    async getCollaborations(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration`);
            return res.status(200).json(collaborations);
        } catch (error) {
            return res.status(500).json({ error: error.message });
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
            return res.status(200).json(collaborations[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/logs
    async getCollaborationLogs(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [logs] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration_logs WHERE collaborationId = ?`, [req.params.id]);
            return res.status(200).json(logs);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaboration/:id/co_writers
    async getCollaborationCoWritersProfileImages(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [coWriters] = await connection.execute(`SELECT profileImage FROM ${TABLE_NAME_PREFIX}_collaboration_cowriter inner join ${TABLE_NAME_PREFIX}_user on ${TABLE_NAME_PREFIX}_user.id = ${TABLE_NAME_PREFIX}_collaboration_cowriter.userId WHERE collaborationId = ?`, [req.params.id]);
            return res.status(200).json(coWriters);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // POST /api/collaboration
    async createCollaboration(req, res) {
        const { userAccessToken, title, description, brandSearchName, developerSearchName } = req.body;
        if (!userAccessToken || !title || !developerSearchName || !brandSearchName || !description) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken", "title", "developerSearchName", "collaborationSearchName", "description"]
            });
        }
        const developerList = await fetch(`https://api.brandfetch.io/v2/search/${developerSearchName}`).then(response => response.json());
        if (developerList.length === 0) {
            return res.status(404).json({ error: `Developer with name ${developerSearchName} not found` });
        }

        const brandList = await fetch(`https://api.brandfetch.io/v2/search/${brandSearchName}`).then(response => response.json());
        if (brandList.length === 0) {
            return res.status(404).json({ error: `Brand with name ${brandSearchName} not found` });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT id FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
            if (users.length === 0) {
                return res.status(404).json({ error: `User with access token ${userAccessToken} not found` });
            }
            const userId = users[0].id;

            const [developers] = await connection.execute(`SELECT id FROM ${TABLE_NAME_PREFIX}_developer WHERE name = ?`, [developerList[0].name]);
            const developerId = developers.length === 0 ? (await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_developer (name, imagePath) VALUES (?, ?)`, [developerList[0].name, developerList[0].icon]))[0].insertId : developers[0].id;

            const [brands] = await connection.execute(`SELECT id FROM ${TABLE_NAME_PREFIX}_brand WHERE name = ?`, [brandList[0].name]);
            const brandId = brands.length === 0 ? (await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_brand (name, threshold, imagePath) VALUES (?, ?, ?)`, [brandList[0].name, 1000, brandList[0].icon]))[0].insertId : brands[0].id;

            const [collaborations] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration (writerId, title, description, developerId, brandId, upvote, downvote, status, aiReadability) VALUES (?, ?, ?, ?, ?, 0, 0, "pending", 0)`, [userId, title, description, developerId, brandId]);
            return res.status(201).json({ message: `Collaboration with id ${collaborations.insertId} created` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // POST /api/collaboration/:id/co_writers/:coWriterId
    async addCollaborationCoWriter(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [coWriters] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_cowriter (collaborationId, coWriterId) VALUES (?, ?)`, [req.params.id, req.params.coWriterId]);
            return res.status(201).json({ message: `Co-writer with id ${req.params.coWriterId} for collaboration id ${req.params.id} created` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/status
    async updateCollaborationStatus(req, res) {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["status"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET status = ? WHERE id = ?`, [status, req.params.id]);
            if (collaborations.affectedRows === 0) {
                return res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Collaboration with id ${req.params.id} updated` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/upvote
    async updateCollaborationUpvote(req, res) {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["amount"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET upvote = upvote + ? WHERE id = ?`, [amount, req.params.id]);
            if (collaborations.affectedRows === 0) {
                return res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Collaboration with id ${req.params.id} updated` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/downvote
    async updateCollaborationDownvote(req, res) {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["amount"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET downvote = downvote + ? WHERE id = ?`, [amount, req.params.id]);
            if (collaborations.affectedRows === 0) {
                return res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Collaboration with id ${req.params.id} updated` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaboration/:id/readability
    async updateCollaborationReadability(req, res) {
        const { readability } = req.body;
        if (!readability) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["readability"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET aiReadability = ? WHERE id = ?`, [readability, req.params.id]);
            if (collaborations.affectedRows === 0) {
                return res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Collaboration with id ${req.params.id} updated` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
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
                return res.status(404).json({ error: `Collaboration with id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Collaboration with id ${req.params.id} deleted` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
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
                return res.status(404).json({ error: `Co-writer with id ${req.params.coWriterId} for collaboration id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Co-writer with id ${req.params.coWriterId} for collaboration id ${req.params.id} deleted` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    }
};

module.exports = { collaborationController };