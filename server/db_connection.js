exports.dbConnection = {
    async createConnection() {
        const mysql = require('mysql/promise');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        return connection;
    }
}