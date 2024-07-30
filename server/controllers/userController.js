const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const userController = {
    // GET /api/user/:id
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
};

module.exports = { userController };