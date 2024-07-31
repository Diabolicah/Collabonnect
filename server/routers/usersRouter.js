const { Router } = require('express');
const { usersController } = require('../controllers/usersController');

const userRouter = Router();

userRouter.get('/login', usersController.getUserAccessToken);
userRouter.get('/:id', usersController.getUserById);

userRouter.post('/register', usersController.registerUser);

module.exports = { userRouter };