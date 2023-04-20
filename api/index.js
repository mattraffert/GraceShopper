const express = require('express');
const apiRouter = express.Router();
const { usersRouter } = require('./users');
const { productsRouter } = require('./products');
const { ordersRouter } = require('./orders');
const { routineActivitiesRouter } = require('./routineActivities');

const { verify } = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { getUserById } = require('../db/users');

apiRouter.use('/', async (req, res, next) => {
	const auth = req.header('Authorization');

	if (!auth) {
		return next();
	}

	if (auth.startsWith('Bearer ')) {
		const token = auth.slice('Bearer '.length);

		try {
			const { id } = verify(token, JWT_SECRET);

			if (id) {
				req.user = await getUserById(id);
				return next();
			}
		} catch ({ name, message }) {
			next({ name, message });
		}
	} else {
		next({ name: 'AuthError', message: 'Error in auth format' });
	}
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/routine_activities', routineActivitiesRouter);

apiRouter.get('/health', (req, res, next) => {
	res.send({ message: 'Server is up and running!' });
});

module.exports = { apiRouter };