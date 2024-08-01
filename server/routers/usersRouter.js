const { Router } = require('express');
const { usersController } = require('../controllers/usersController');

const userRouter = Router();

userRouter.get('/:id', usersController.getUserById);

userRouter.post('/', usersController.getUserByAccessToken);
userRouter.post('/login', usersController.getUserAccessToken);
userRouter.post('/register', usersController.registerUser);

module.exports = { userRouter };