require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const { collaborationRouter } = require('./routers/collaborationsRouter');
const { userRouter } = require('./routers/usersRouter');
const { developerRouter } = require('./routers/developersRouter');
const { brandRouter } = require('./routers/brandsRouter');
const { badgeRouter } = require('./routers/badgesRouter');

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

app.use('/api/collaborations', collaborationRouter);
app.use('/api/users', userRouter);
app.use('/api/developers', developerRouter);
app.use('/api/brands', brandRouter);
app.use('/api/badges', badgeRouter);

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});