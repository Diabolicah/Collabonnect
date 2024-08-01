const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112";

async function isUserPartOfBrand(userAccessToken, brandId) {
    const connection = await dbConnection.createConnection();
    const [user] = await connection.execute(`SELECT brandId FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
    if (user.length === 0 || user[0].brandId != brandId) {
        connection.end();
        return false;
    }
    connection.end();
    return true;
}

const brandController = {
    // GET /api/brand/
    async getAllBrands(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT id, name, threshold, imagePath FROM ${TABLE_NAME_PREFIX}_brand`);
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/brand/:id
    async getBrandById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT name, threshold, imagePath FROM ${TABLE_NAME_PREFIX}_brand WHERE id = ?`, [req.params.id]);
            if (users.length === 0) {
                return res.status(404).json({ error: `Brand with id ${req.params.id} not found` });
            }
            return res.status(200).json(users[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/brand/:id/threshold
    async updateBrandThresholdById(req, res) {
        const { userAccessToken, threshold } = req.body;
        if (!userAccessToken, !threshold) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken", "threshold"]
            });
        }
        
        const thresholdInt = parseInt(threshold);
        if (isNaN(thresholdInt) || thresholdInt < 0) {
            return res.status(400).json({
                error: "Threshold must be a positive integer",
                fields: ["threshold"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            if (!await isUserPartOfBrand(userAccessToken, req.params.id)) {
                return res.status(403).json({ error: "User is not part of this brand" });
            }

            const [users] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_brand SET threshold = ? WHERE id = ?`, [thresholdInt, req.params.id]);
            if (users.affectedRows === 0) {
                return res.status(404).json({ error: `Brand with id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Brand with id ${req.params.id} updated successfully` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    }
};

module.exports = { brandController };