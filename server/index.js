require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const { collaborationRouter } = require('./routers/collaborationRouter');
const { userRouter } = require('./routers/userRouter');
const { developerRouter } = require('./routers/developerRouter');
const { brandRouter } = require('./routers/brandRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
    res.set('Content-Type', 'application/json');
    next();
});

app.use("/assets", express.static(`${__dirname}/public`));

app.use('/api/collaboration', collaborationRouter);
app.use('/api/user', userRouter);
app.use('/api/developer', developerRouter);
app.use('/api/brand', brandRouter);

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});8