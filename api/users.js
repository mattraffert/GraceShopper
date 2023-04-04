const express = require('express');
const usersRouter = express.Router();
const { getUserByUsername, createUser, getUserById } = require('../db/users');
const { getPublicRoutinesByUser, getAllRoutinesByUser } = require('../db/routines');
const { requireUser } = require('./require');
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
			res.send({ 
				error: "Duplicate Username",
				message: `User ${user.username} is already taken.`,
				name: "Error"
			});
			throw Error('A user by that username already exists');
		}

		if (password.length < 8) {
			res.send({ 
				error: "Short password",
				message: `Password Too Short!`,
				name: "Error"
			});
			throw Error('Password Too Short!');
		}
		const newUser = await createUser({ username, password });

		let payload = { 
			"id" : newUser.id,
			"username" : `${newUser.username}`
		};
		let token = sign( payload, JWT_SECRET,  { noTimestamp:true, expiresIn: '1h' });

		res.send({ 
			message: "thank you for signing up",
			token: `${token}`,
			user: newUser
		});
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
			let payload = { 
				"id" : user.id,
				"username" : `${user.username}`
			};
			let token = sign( payload, JWT_SECRET,  { noTimestamp:true, expiresIn: '1h' });

			res.send({ 
				token: token,
				user: {
					id: user.id,
					username: `${user.username}`
					},
				message: "you're logged in!"
			});
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
		const allRoutines = await getAllRoutinesByUser({ username })

		if (publicRoutines) {
			res.send(publicRoutines);
		} else {
			res.send({ message: 'No public routines available' });
		}

		if (allRoutines) {
			res.send(allRoutines);
		} else {
			res.send({ message: 'No routines available' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = { usersRouter };
