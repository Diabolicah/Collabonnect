const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const usersController = {
    // GET /api/users/:id
    async getUserById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT developerId, brandId, firstName, lastName, username, profileImage, token, rank, experience FROM ${TABLE_NAME_PREFIX}_user WHERE id = ?`, [req.params.id]);
            if (users.length === 0) {
                return res.status(404).json({ error: `User with id ${req.params.id} not found` });
            }
            return res.status(200).json(users[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // get /api/users/login
    async getUserAccessToken(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Please provide both username and password' });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [rows] = await connection.execute(`SELECT userAccessToken FROM ${TABLE_NAME_PREFIX}_user WHERE username = ? AND password = ?`, [username, password]);
            if (rows.length === 0) {
                return res.status(404).json({error: 'Invalid details'});
            }
            if (rows[0].userAccessToken === null) {
                const userAccessToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const [rows] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_user SET userAccessToken = ? WHERE username = ? AND password = ?`, [userAccessToken, username, password]);
                if (rows.affectedRows === 0) {
                    return res.status(500).json({ error: 'Internal server error at login user' });
                }
                return res.status(200).json({ userAccessToken });
            }
            return res.status(200).json(rows[0]);
        } catch (error) {
            return res.status(500).json({error: error.message});
        } finally {
            await connection.end();
        }
    },
    // GET /api/users
    async getUseByAccessToken(req, res) {
        const { userAccessToken } = req.body;
        if (!userAccessToken) {
            return res.status(400).json({ error: 'Please provide userAccessToken' });
        }
        const connection = await dbConnection.createConnection();
        try {
            const [users] = await connection.execute(`SELECT id, developerId, brandId, firstName, lastName, username, profileImage, token, rank, experience FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json(users[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            await connection.end();
        }
    },
    // POST /api/users/register
    async registerUser(req, res) {
        const { username, password, firstName, lastName, developerId, brandId, profileImage} = req.body;

        if (!username || !password || !firstName || !lastName || !profileImage) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["username", "password", "firstName", "lastName"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [usernames] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_user WHERE username = ?`, [username]);
            if (usernames.length > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            if (developerId) {
                const [developers] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_developer WHERE id = ?`, [developerId]);
                if (developers.length === 0) {
                    return res.status(404).json({ error: 'Developer not found' });
                }
            }
            if (brandId) {
                const [brands] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_brand WHERE id = ?`, [brandId]);
                if (brands.length === 0) {
                    return res.status(404).json({ error: 'Brand not found' });
                }
            }
            const userAccessToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const [rows] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_user (username, password, userAccessToken, firstName, lastName, profileImage, developerId, brandId, token, rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [username, password, userAccessToken, firstName, lastName, profileImage, developerId || null, brandId || null, 3, 1]);
            console.log(userAccessToken);
            if (rows.affectedRows === 0) {
                return res.status(500).json({ error: 'Internal server error at register user' });
            }

            res.status(201).json({
                userAccessToken: userAccessToken
            });
        } catch (error) {
            res.status(500).json({error: error.message});
        } finally {
            await connection.end();
        }
    }
};

module.exports = { usersController };