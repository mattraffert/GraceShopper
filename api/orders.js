const express = require('express');
const ordersRouter = express.Router();
const { requireUser } = require('./require');
const {
	getOrderById,
	updateOrder,
	destroyOrder
} = require('../db/order.js');
const {
	addProductToUser
} = require('../db/order');

ordersRouter.patch(
	'/:orderId',
	requireUser,
	async (req, res, next) => {
		const id = req.params.orderId;
		const userId = req.user.id;
		const { quantity, active } = req.body;

		try {
			const order = await getOrderById(id);
			const creatorId = order.userId;
			

			if (creatorId !== userId) {
				return res.send({ 
					error: "Not owner",
					message: `User is not allowed to update order`,
					name: "Error"
				});
			}

			if (Object.keys(req.body).length === 0) {
				res.send({ message: 'Missing fields' });
			} else {
				const updatedOrder = await updateOrder({
					id,
					quantity,
					active
				});

				res.send(updatedOrder);
			}
		} catch ({ name, message }) {
			next({ name, message });
		}
	}
);

ordersRouter.delete(
	'/:orderId',
	requireUser,
	async (req, res, next) => {
		const id = req.params.orderId;
		const userId = req.user.id;

		try {
			const order = await getOrderById(id);
			const creatorId = order.userId;

			if (creatorId !== userId) {
				return res.send({ 
					error: "Not owner",
					message: `User is not allowed to delete this order.`,
					name: "Error"
				});
			}

			const destroyedOrder = await destroyOrder(id);
			res.send(destroyedOrder);
		} catch ({ name, message }) {
			next({ name, message });
		}
	}
);

ordersRouter.post('/:productId/users', requireUser, async (req, res, next) => {
	const { productId } = req.params;
	const { userId, quantity } = req.body;

	if (!productId) {
		res.send({ message: 'Missing productId' });
	}
	if (!quantity) {
		res.send({ message: 'Missing quantity' });
	}
	if (!userId) {
		res.send({ message: 'Missing userId' });
	}

	try {
		const newOrder = await addProductToUser({
			userId,
			productId,
			quantity
		});

		res.send(newOrder);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = { ordersRouter };
