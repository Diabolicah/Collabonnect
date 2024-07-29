const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const badgeController = {
    // GET /api/badge/
    async getBadges(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [badges] = await connection.execute(`SELECT id, name, imageName FROM ${TABLE_NAME_PREFIX}_badge`);
            res.status(200).json(badges);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/badge/:id
    async getBadgeById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [badges] = await connection.execute(`SELECT name, imageName FROM ${TABLE_NAME_PREFIX}_badge WHERE id = ?`, [req.params.id]);
            if (badges.length === 0) {
                res.status(404).json({ error: `Badge with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(badges[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/badge/images
    async getBadgeImages(req, res) {
        const fs = require('fs');
        const path = require('path');
        const directoryPath = path.join(__dirname, '../public/badgeImages');
        const files = fs.readdirSync(directoryPath);
        res.status(200).json(files);
    },
    // POST /api/badge/
    async createBadge(req, res) {
        const { name, description, imageName } = req.body;
        if (!name || !imageName || !description) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["name", "imageName", "description"]
            });
            return;
        }

        const connection = await dbConnection.createConnection();

        try {
            const [badges] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_badge (name, description, imageName) VALUES (?, ?, ?)`, [name, description, imageName]);
            res.status(201).json({ id: badges.insertId, message: "Badge created successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/badge/:id
    async updateBadgeById(req, res) {
        const { name, description, imageName } = req.body;
        if (!name || !imageName || !description) {
            res.status(400).json({
                error: "All fields are required",
                fields: ["name", "imageName", "description"]
            });
            return;
        }

        const connection = await dbConnection.createConnection();

        try {
            const [badges] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_badge SET name = ?, description = ?, imageName = ? WHERE id = ?`, [name, description, imageName, req.params.id]);
            if (badges.affectedRows === 0) {
                res.status(404).json({ error: `Badge with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json({ message: `Badge with id ${req.params.id} updated successfully` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // DELETE /api/badge/:id
    async deleteBadgeById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [badges] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_badge WHERE id = ?`, [req.params.id]);
            if (badges.affectedRows === 0) {
                res.status(404).json({ error: `Badge with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json({ message: `Badge with id ${req.params.id} deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    }
};

module.exports = { badgeController };