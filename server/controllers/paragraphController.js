const {dbConnection} = require('../db_connection');
const rs = require('readability-score');

const TABLE_NAME_PREFIX = "tbl_112"

function checkParagraphReadability(title, text) {
    const titleReadability = rs.fleschReadingEase(title);
    const textReadability = rs.fleschReadingEase(text);
    return Math.round((titleReadability + textReadability) / 2);
}

async function isUserPartOfCollaboration(userAccessToken, collaborationId) {
    const connection = await dbConnection.createConnection();
    const [collaborationUser] = await connection.execute(`SELECT writerId FROM ${TABLE_NAME_PREFIX}_collaboration WHERE id = ?`, [collaborationId]);
    if (collaborationUser.length === 0) {
        return false;
    }

    const [users] = await connection.execute(`SELECT id FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
    if (users.length === 0 || users[0].id != collaborationUser[0].writerId) {
        return false;
    }

    connection.end();
    return true;
}

const paragraphController = {
    // GET /api/collaborations/:id/paragraphs
    async getCollaborationParagraphs(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraphId WHERE collaborationId = ?`, [req.params.id]);
            return res.status(200).json(paragraphs);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaborations/:id/paragraphs/:paragraphId
    async getCollaborationParagraphById(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [paragraphs] = await connection.execute(`SELECT id, newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo FROM ${TABLE_NAME_PREFIX}_collaboration_paragraph inner join ${TABLE_NAME_PREFIX}_paragraph on ${TABLE_NAME_PREFIX}_paragraph.id = ${TABLE_NAME_PREFIX}_collaboration_paragraph.paragraphId WHERE collaborationId = ? and paragraphId = ?`, [req.params.id, req.params.paragraphId]);
            if (paragraphs.length === 0) {
                return res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            return res.status(200).json(paragraphs[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // GET /api/collaborations/paragraphs/images
    async getCollaborationParagraphImages(req, res) {
        const fs = require('fs');
        const path = require('path');
        const directoryPath = path.join(__dirname, '../public/collaborationParagraphImages');
        const files = fs.readdirSync(directoryPath);
        return res.status(200).json(files);
    },
    // GET /api/collaborations/paragraphs/videos
    async getCollaborationParagraphVideos(req, res) {
        const videoLinks = ["https://www.youtube.com/embed/YwJotfRP1MI", "https://www.youtube.com/embed/1MIb7RkePSk"]
        return res.status(200).json(videoLinks);
    },
    // POST /api/collaborations/:id/paragraphs
    async createCollaborationParagraph(req, res) {
        const { paragraphType, userAccessToken } = req.body;
        const paragraphTypesJson = require('../Data/paragraphTypes.json');

        if (!paragraphType || Object.keys(paragraphTypesJson).includes(paragraphType) === false || !userAccessToken) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["paragraphType", "userAccessToken"]
            });
        }
        const connection = await dbConnection.createConnection();
        try {
            if (!await isUserPartOfCollaboration(userAccessToken, req.params.id)) {
                return res.status(403).json({ error: "User not part of collaboration" });
            }

            const [paragraphs] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_paragraph (newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo, readability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, ["", "", "Up to date", "", "", "", paragraphTypesJson[paragraphType].oldImage, "", paragraphTypesJson[paragraphType].oldVideo, "0"]);
            if(paragraphs.affectedRows === 0){
                return res.status(404).json({ error: `Couldn't create paragraph for collaboration id ${req.params.id}` });
            }
            const [rows] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_paragraph (collaborationId, paragraphId) VALUES (?, ?)`, [req.params.id, paragraphs.insertId]);
            if(rows.affectedRows === 0) {
                return res.status(404).json({ error: `Couldn't create paragraph for collaboration id ${req.params.id}` });
            }
            const [paragraph] = await connection.execute(`SELECT id, newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo FROM ${TABLE_NAME_PREFIX}_paragraph WHERE id = ?`, [paragraphs.insertId]);
            if(paragraph.length === 0){
                    return res.status(404).json({ error: `Couldn't create paragraph for collaboration id ${req.params.id}` });
            }
            return res.status(201).json({ message: `Paragraph with id ${paragraphs.insertId} for collaboration id ${rows.insertId} created`, paragraph: paragraph });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaborations/:id/paragraphs
    async updateCollaborationParagraphs(req, res) {
        const { userAccessToken, paragraphs } = req.body;
        if (!userAccessToken, !paragraphs || paragraphs.length === 0) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken, paragraphs"]
            });
        }
        const connection = await dbConnection.createConnection();
        try {
            if (!await isUserPartOfCollaboration(userAccessToken, req.params.id)) {
                return res.status(403).json({ error: "User not part of collaboration" });
            }
            const [users] = await connection.execute(`SELECT id FROM ${TABLE_NAME_PREFIX}_user WHERE userAccessToken = ?`, [userAccessToken]);
            if (users.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            const userId = users[0].id;
            let sum = 0;
            paragraphs.forEach(async (paragraph) => {
                const { newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo } = paragraph;
                if (!status || !paragraph.id) {
                    return res.status(400).json({
                        error: "All fields are required",
                        fields: ["status", "id"]
                    });
                }
                let paragraphReadability = checkParagraphReadability(newTitle, newText);
                sum += paragraphReadability < 0 ? 0 : paragraphReadability > 100 ? 100 : paragraphReadability;

                const [paragraphs] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_paragraph SET newTitle = ?, oldTitle = ?, status = ?, newText = ?, oldText = ?, newImage = ?, oldImage = ?, newVideo = ?, oldVideo = ? WHERE id = ?`, [newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo, paragraph.id]);
                if (paragraphs.affectedRows === 0) {
                    return res.status(404).json({ error: `Paragraph with id ${paragraph.id} for collaboration id ${req.params.id} not found` });
                }
            });

            const avg = Math.round(sum / paragraphs.length);
            const [collaborations] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_collaboration SET aiReadability = ? WHERE id = ?`, [avg, req.params.id]);
            if (collaborations.affectedRows === 0) {
                return res.status(404).json({ error: `Couldn't update ai readability for Collaboration with id ${req.params.id}, Collaboration not found` });
            }
            
            let date = new Date();
            let dd = String(date.getDate()).padStart(2, '0');
            let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = date.getFullYear();

            date = yyyy + '-' + mm + '-' + dd;
            // const date = Date.now().toLocaleString().slice(0, 19).replace('T', ' ');
            console.log(date);
            const [editLog] = await connection.execute(`SELECT * FROM ${TABLE_NAME_PREFIX}_collaboration_logs WHERE userId = ? and collaborationId = ? and date = ?`, [userId, req.params.id, date]);
            if (editLog.length > 0) {
                return res.status(409).json({ error: `Edit log for collaboration id ${req.params.id} already exists` });
            }
            const [editLogs] = await connection.execute(`INSERT INTO ${TABLE_NAME_PREFIX}_collaboration_logs (userId, collaborationId, date) VALUES (?, ?, Date(?))`, [userId, req.params.id, date]);
            if (editLogs.affectedRows === 0) {
                return res.status(404).json({ error: `Couldn't create log for collaboration id ${req.params.id}` });
            }
            return res.status(200).json({ message: `Paragraphs for collaboration id ${req.params.id} updated`});
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // PUT /api/collaborations/:id/paragraphs/:paragraphId
    async updateCollaborationParagraph(req, res) {
        const { userAccessToken, newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo } = req.body;
        if (!status || !userAccessToken) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["status", "userAccessToken"]
            });
        }

        let paragraphReadability = checkParagraphReadability(newTitle, newText);
        paragraphReadability = paragraphReadability < 0 ? 0 : paragraphReadability ? 100 : paragraphReadability;

        const connection = await dbConnection.createConnection();
        try {
            if (!await isUserPartOfCollaboration(userAccessToken, req.params.id)) {
                return res.status(403).json({ error: "User not part of collaboration" });
            }

            const [paragraphs] = await connection.execute(`UPDATE ${TABLE_NAME_PREFIX}_paragraph SET newTitle = ?, oldTitle = ?, status = ?, newText = ?, oldText = ?, newImage = ?, oldImage = ?, newVideo = ?, oldVideo = ?, readability = ? WHERE id = ?`, [newTitle, oldTitle, status, newText, oldText, newImage, oldImage, newVideo, oldVideo, paragraphReadability, req.params.paragraphId]);
            if (paragraphs.affectedRows === 0) {
                return res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} updated` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    },
    // DELETE /api/collaborations/:id/paragraphs/:paragraphId
    async deleteCollaborationParagraph(req, res) {
        const { userAccessToken } = req.body;
        if (!userAccessToken) {
            return res.status(400).json({
                error: "All fields are required",
                fields: ["userAccessToken"]
            });
        }
        const connection = await dbConnection.createConnection();

        try {
            if (!await isUserPartOfCollaboration(userAccessToken, req.params.id)) {
                return res.status(403).json({ error: "User not part of collaboration" });
            }

            const [paragraphs] = await connection.execute(`DELETE FROM ${TABLE_NAME_PREFIX}_paragraph WHERE id = ?`, [req.params.paragraphId]);
            if (paragraphs.affectedRows === 0) {
                return res.status(404).json({ error: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} not found` });
            }
            return res.status(200).json({ message: `Paragraph with id ${req.params.paragraphId} for collaboration id ${req.params.id} deleted` });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        } finally {
            connection.end();
        }
    }
}

module.exports = { paragraphController };