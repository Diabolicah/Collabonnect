const { Router } = require('express');
const { usersController } = require('../controllers/usersController');

const userRouter = Router();

userRouter.get('/', usersController.getUserByAccessToken);
userRouter.get('/:id', usersController.getUserById);

userRouter.post('/login', usersController.getUserAccessToken);
userRouter.post('/register', usersController.registerUser);

module.exports = { userRouter };