const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const userController = {
    async getUserById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT developer_id, brand_id, first_name, last_name, username, profile_image, token, rank FROM ${TABLE_NAME_PREFIX}_user WHERE id = ?`, [req.params.id]);
            if (users.length === 0) {
                res.status(404).json({ error: `User with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(users[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
};

module.exports = { userController };