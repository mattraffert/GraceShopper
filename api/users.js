const express = require('express');
const usersRouter = express.Router();
const { getUserByUsername, createUser, getUserById } = require('../db/users');
const { getPublicRoutinesByUser } = require('../db/routines');
const { compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

usersRouter.post('/register', async (req, res, next) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			throw Error('Missing fields');
		}

		const user = await getUserByUsername(username);

		if (user) {
			throw Error('A user by that username already exists');
		}

		if (password.length < 8) {
			throw Error('Password Too Short!');
		}
		const newUser = await createUser({ username, password });

		res.send({ user: newUser });
	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			throw Error('Missing password or username credentials');
		}

		const user = await getUserByUsername(username);

		if (!user) {
			throw Error('User does not exist');
		}

		const match = await compare(password, user.password);

		if (user && !match) {
			throw Error('Password is incorrect');
		}

		if (user && match) {
			const token = sign(
				{ id: user.id, username: user.username },
				JWT_SECRET
			);

			res.send({ message: 'You are logged in!', token });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.get('/me', requireUser, async (req, res, next) => {
	const id = req.user.id;

	try {
		const userData = await getUserById(id);

		if (userData) {
			res.send(userData);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.get('/:username/routines', async (req, res, next) => {
	const { username } = req.params;

	try {
		const publicRoutines = await getPublicRoutinesByUser({ username });

		if (publicRoutines) {
			res.send(publicRoutines);
		} else {
			res.send({ message: 'No public routines available' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

const requireUser = (req, res, next) => {
	if (!req.user) {
		next({
			name: 'AuthError',
			message: 'You must be logged in to perform this action'
		});
	} else {
		console.log('User is set');
		return next();
	}
};

module.exports = { usersRouter };
