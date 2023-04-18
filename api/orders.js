const express = require('express');
const ordersRouter = express.Router();
const { requireUser } = require('./require');
const {
	getOrderById,
	updateOrder,
	destroyRoutineActivity
} = require('../db/order.js');
const { getRoutineById } = require('../db/routines.js');
const { getUserById } = require('../db');

ordersRouter.patch(
	'/:orderId',
	requireUser,
	async (req, res, next) => {
		const id = req.params.orderId;
		const userId = req.user.id;
		const { quantity, active } = req.body;

		try {
			const order = await getOrderById(id);
			const userId = order.userId;
			const user = await getUserById(userId);
			const creatorId = user.id;

			if (creatorId !== userId) {
				return res.send({ 
					error: "Not owner",
					message: `User ${user.email} is not allowed to update order`,
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

routineActivitiesRouter.delete(
	'/:routineActivityId',
	requireUser,
	async (req, res, next) => {
		const id = req.params.routineActivityId;
		const userId = req.user.id;

		try {
			const routineActivity = await getRoutineActivityById(id);
			const routineId = routineActivity.routineId;
			const routine = await getRoutineById(routineId);
			const creatorId = routine.creatorId;
			const username = await getUserById(userId)

			if (creatorId !== userId) {
				return res.send({ 
					error: "Not owner",
					message: `User ${username.username} is not allowed to delete ${routine.name}`,
					name: "Error"
				});
			}

			const destroyedRoutineActivity = await destroyRoutineActivity(id);
			res.send(destroyedRoutineActivity);
		} catch ({ name, message }) {
			next({ name, message });
		}
	}
);

module.exports = { routineActivitiesRouter };
