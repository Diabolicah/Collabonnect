const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

async function isUserPartOfCollaboration(userAccessToken, collaborationId) {
    const connection = await dbConnection.createConnection();
    const [collaborationUser] = await connection.execute(`SELECT writerId FROM ${TABLE_NAME_PREFIX}_collaboration WHERE id = ?`, [collaborationId]);
    if (collaborationUser.length === 0) {
        return false;
    }

    const [users] = await connection.execute(`SELECT userId FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
    if (users.length === 0 || users[0].userId != collaborationUser[0].writerId) {
        return false;
    }

    connection.end();
    return true;
}

const collaborationController = {
    // GET /api/collaborations
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
    // GET /api/collaborations/:id
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
    // GET /api/collaborations/:id/logs
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
    // GET /api/collaborations/:id/co_writers
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
    // POST /api/collaborations
    async createCollaboration(req, res) {
        const { userAccessToken, title, description, brandSearchName, developerSearchName } = req.body;
        if (!userAccessToken || !title || !developerSearchName || !brandSearchName || !description) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken", "title", "developerSearchName", "brandSearchName", "description"]
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
    // POST /api/collaborations/:id/co_writers/:coWriterId
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
    // PUT /api/collaborations/:id/status
    async updateCollaborationStatus(req, res) {
        const { status, userAccessToken } = req.body;
        if (!userAccessToken || !status) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken", "status"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT id FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
            if (users.length === 0) {
                return res.status(404).json({ error: `User with access token ${userAccessToken} not found` });
            }

            const [brands] = await connection.execute(`SELECT brandId FROM ${TABLE_NAME_PREFIX}_user WHERE id = ?`, [users[0].id]);
            if (brands.length === 0) {
                return res.status(404).json({ error: `Brand with id ${users[0].id} not found` });
            }
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET status = ? WHERE id = ? and brandId = ?`, [status, req.params.id, brands[0].brandId]); 
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
    // PUT /api/collaborations/:id/upvote
    async updateCollaborationUpvote(req, res) {
        const { userAccessToken, amount } = req.body;
        if (!userAccessToken  || !amount) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken", "amount"]
            });
        }
        const connection = await dbConnection.createConnection();
        try {
            const [user] = await connection.execute(`SELECT id FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
            if (user.length === 0) {
                return res.status(404).json({ error: `User with access token ${userAccessToken} not found` });
            }
            const [users] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_user SET tokens = tokens - ? WHERE id = ? and tokens >= ?`, [amount, user[0].id, amount]);
            if (users.affectedRows === 0) {
                return res.status(403).json({ error: `User with id ${user[0].id} does not have enough tokens` });
            }
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
    // PUT /api/collaborations/:id/downvote
    async updateCollaborationDownvote(req, res) {
        const { userAccessToken, amount } = req.body;
        if (!userAccessToken, !amount) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken", "amount"]
            });
        }
        const connection = await dbConnection.createConnection();
        try {
            const [user] = await connection.execute(`SELECT id FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
            if (user.length === 0) {
                return res.status(404).json({ error: `User with access token ${userAccessToken} not found` });
            }
            const [users] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_user SET tokens = tokens - ? WHERE id = ? and tokens >= ?`, [amount, user[0].id, amount]);
            if (users.affectedRows === 0) {
                return res.status(403).json({ error: `User with id ${user[0].id} does not have enough tokens` });
            }
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
    // PUT /api/collaborations/:id/readability
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
    // DELETE /api/collaborations/:id
    async deleteCollaboration(req, res) {
        const { userAccessToken } = req.body;
        if (!userAccessToken) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken"]
            });
        }

        const connection = await dbConnection.createConnection();
        try {
            if (!await isUserPartOfCollaboration(userAccessToken, req.params.id)) {
                return res.status(403).json({ error: "User is not part of this collaboration" });
            }

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
};

module.exports = { collaborationController };