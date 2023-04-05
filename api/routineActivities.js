const express = require('express');
const routineActivitiesRouter = express.Router();
const { requireUser } = require('./require');
const {
	updateRoutineActivity,
	getRoutineActivityById,
	destroyRoutineActivity
} = require('../db/routine_activities.js');
const { getRoutineById } = require('../db/routines.js');
const { getUserById } = require('../db');

routineActivitiesRouter.patch(
	'/:routineActivityId',
	requireUser,
	async (req, res, next) => {
		const id = req.params.routineActivityId;
		const userId = req.user.id;
		const { count, duration } = req.body;

		try {
			const routineActivity = await getRoutineActivityById(id);
			const routineId = routineActivity.routineId;
			const routine = await getRoutineById(routineId);
			const creatorId = routine.creatorId;
			const username = await getUserById(userId)

			if (creatorId !== userId) {
				return res.send({ 
					error: "Not owner",
					message: `User ${username.username} is not allowed to update ${routine.name}`,
					name: "Error"
				});
			}

			if (Object.keys(req.body).length === 0) {
				res.send({ message: 'Missing fields' });
			} else {
				const updatedRoutineActivity = await updateRoutineActivity({
					id,
					count,
					duration
				});

				res.send(updatedRoutineActivity);
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
