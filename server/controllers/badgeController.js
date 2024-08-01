const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

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

const badgeController = {
    // GET /api/badges/
    async getBadges(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [badges] = await connection.execute(`SELECT id, name, description, imageName, brandId FROM ${TABLE_NAME_PREFIX}_badge left join ${TABLE_NAME_PREFIX}_brand_badge on ${TABLE_NAME_PREFIX}_badge.id = ${TABLE_NAME_PREFIX}_brand_badge.badgeId`);
            return res.status(200).json(badges);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/badges/:id
    async getBadgeById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [badges] = await connection.execute(`SELECT name, description, imageName FROM ${TABLE_NAME_PREFIX}_badge WHERE id = ?`, [req.params.id]);
            if (badges.length === 0) {
                return res.status(404).json({ error: `Badge with id ${req.params.id} not found` });
            }
            return res.status(200).json(badges[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/badges/images
    async getBadgeImages(req, res) {
        const fs = require('fs');
        const path = require('path');
        const directoryPath = path.join(__dirname, '../public/badgeImages');
        const files = fs.readdirSync(directoryPath);
        return res.status(200).json(files);
    },
    // POST /api/badges/
    async createBadge(req, res) {
        const { userAccessToken, name, description, imageName, brandId } = req.body;
        if (!userAccessToken, !name || !imageName || !description || !brandId) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken", "name", "imageName", "description", "brandId"]
            });
        }
        const connection = await dbConnection.createConnection();

        try {
            if (!isUserPartOfBrand(userAccessToken, brandId)) {
                return res.status(403).json({ error: "User is not part of the brand" });
            }

            const [badges] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_badge (name, description, imageName) VALUES (?, ?, ?)`, [name, description, imageName]);
            if (badges.affectedRows !== 0) {
                await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_brand_badge (brandId, badgeId) VALUES (?,?)`, [brandId, badges.insertId]);
                return res.status(201).json({ id: badges.insertId, message: "Badge created successfully" });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // DELETE /api/badges/:id
    async deleteBadgeById(req, res) {
        const { userAccessToken } = req.body;
        if (!userAccessToken) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken"]
            });
        }

        const connection = await dbConnection.createConnection();

        try {
            const [badgeBrand] = await connection.execute(`SELECT brandId FROM ${TABLE_NAME_PREFIX}_brand_badge WHERE badgeId = ?`, [req.params.id]);
            if (badgeBrand.length === 0) {
                return res.status(404).json({ error: `Badge with id ${req.params.id} not found` });
            }

            if (!isUserPartOfBrand(userAccessToken, badgeBrand[0].brandId)) {
                return res.status(403).json({ error: "User is not part of the brand" });
            }

            const [badges] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_badge WHERE id = ?`, [req.params.id]);
            if (badges.affectedRows === 0) {
                return res.status(404).json({ error: `Badge with id ${req.params.id} not found` });
            }
            return res.status(204).json({ message: `Badge with id ${req.params.id} deleted successfully` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    }
};

module.exports = { badgeController };