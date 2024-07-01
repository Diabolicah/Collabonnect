const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const developerController = {
    async getDeveloperById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT name, image_name FROM ${TABLE_NAME_PREFIX}_developer WHERE id = ?`, [req.params.id]);
            if (users.length === 0) {
                res.status(404).json({ error: `Developer with id ${req.params.id} not found` });
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

module.exports = { developerController };