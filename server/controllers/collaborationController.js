const {dbConnection} = require('../db_connection');

const TABLE_NAME_PREFIX = "tbl_112"

const collaborationController = {
    // GET /api/collaboration
    async getCollaborations(req, res) {
        const connection = await dbConnection.createConnection();
        const [collaborations] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration`);
        connection.end();
        res.json(collaborations);
    },
    // GET /api/collaboration/:id
    async getCollaborationById(req, res) {},
    // POST /api/collaboration
    async createCollaboration(req, res) {},
    // PUT /api/collaboration/:id
    async updateCollaboration(req, res) {},
    // DELETE /api/collaboration/:id
    async deleteCollaboration(req, res) {}
};

module.exports = { collaborationController };