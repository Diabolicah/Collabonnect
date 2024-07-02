const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const brandController = {
    // GET /api/brand/
    async getAllBrands(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT id, name, threshold, image_name FROM ${TABLE_NAME_PREFIX}_brand`);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/brand/:id
    async getBrandById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT name, threshold, image_name FROM ${TABLE_NAME_PREFIX}_brand WHERE id = ?`, [req.params.id]);
            if (users.length === 0) {
                res.status(404).json({ error: `Brand with id ${req.params.id} not found` });
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

module.exports = { brandController };