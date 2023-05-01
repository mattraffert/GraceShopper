const express = require('express');
const usersRouter = express.Router();
const { getUserByEmail, createUser, getUserById, updateUser, getAllUsers } = require('../db/users');
const { getOrderById } = require('../db/order');
const { getReviewByUser } = require('../db/reviews');
const { requireUser } = require('./require');
const { compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

usersRouter.post('/register', async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			throw Error('Missing fields');
		}

		const user = await getUserByEmail(email);

		if (user) {
			res.send({ 
				error: "Duplicate Username",
				message: `User ${user.email} is already taken.`,
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
		const newUser = await createUser({ email, password });

		let payload = { 
			"id" : newUser.id,
			"email" : `${newUser.email}`
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
		const { email, password } = req.body;

		if (!email || !password) {
			throw Error('Missing password or email credentials');
		}

		const user = await getUserByEmail(email);

		if (!user) {
			throw Error('Email does not exist');
		}

		const match = await compare(password, user.password);

		if (user && !match) {
			throw Error('Password is incorrect');
		}

		if (user && match) {
			let payload = { 
				"id" : user.id,
				"email" : `${user.email}`
			};
			let token = sign( payload, JWT_SECRET,  { noTimestamp:true, expiresIn: '1h' });

			res.send({ 
				token: token,
				user: {
					id: user.id,
					email: `${user.email}`
					},
				message: "you're logged in!"
			});
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.get('/me', requireUser, async (req, res, next) => {
	const { id } = req.body;

	try {
		const userData = await getUserById(id);

		if (userData) {
			res.send(userData);
		} else {
			res.send({ 
				error: "No logged in user",
				message: "You must be logged in to perform this action",
				name: "Error"
			});
			throw Error("No user")
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.get('/:userId/order', async (req, res, next) => {
	const { userId } = req.params;

	try {
		const order = await getOrderById( userId );

		if (order) {
			res.send(order);
		} else {
			res.send({ message: 'No order available' });
		}

	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.get('/:username/reviews', async (req, res, next) => {
	const { email } = req.params;

	try {
		const reviews = await getReviewByUser({ email })

		if (reviews) {
			res.send(reviews);
		} else {
			res.send({ message: 'No reviews available' });
		}

	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.patch('/:userId', requireUser, async (req, res, next) => {
	const { admin, engineer } = req.body;
	const { userId } = req.params;
	const userExists = await getUserById(userId);

	try{
		if (!userExists) {
			throw Error
		}
		if (userId || admin || engineer) {
			const updatedUser = await updateUser({
				id: userId,
				admin,
				engineer
			});

			res.send(updatedUser)
		} else {
			res.send({
				message: `Missing fields`
			})
		}
	} catch ({name, message}) {
		next({name, message})
	}
})

usersRouter.get('/', async (req, res, next) => {
	try{
		const allUsers = await getAllUsers();

		if (allUsers) {
			res.send(allUsers);
		} else {
			res.send({
				message: `No users found`
			})
		}
	} catch ({ name, message }) {
		next ({ name, message })
	}
})

module.exports = { usersRouter };
// comment