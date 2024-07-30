const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const developerController = {
    // GET /api/developer/
    async getAllDevelopers(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT id, name, imagePath FROM ${TABLE_NAME_PREFIX}_developer`);
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/developer/:id
    async getDeveloperById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT name, imagePath FROM ${TABLE_NAME_PREFIX}_developer WHERE id = ?`, [req.params.id]);
            if (users.length === 0) {
                return res.status(404).json({ error: `Developer with id ${req.params.id} not found` });
            }
            return res.status(200).json(users[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
};

module.exports = { developerController };