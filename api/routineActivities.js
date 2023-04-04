const express = require('express');
const routineActivitiesRouter = express.Router();
const { requireUser } = require('./require');
const {
	updateRoutineActivity,
	getRoutineActivityById,
	destroyRoutineActivity
} = require('../db/routine_activities.js');
const { getRoutineById } = require('../db/routines.js');

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

			if (creatorId !== userId) {
				return res.send('you dont own this routine');
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

			if (creatorId !== userId) {
				return res.send('you dont own this routine');
			}

			const destroyedRoutineActivity = await destroyRoutineActivity(id);
			res.send(destroyedRoutineActivity);
		} catch ({ name, message }) {
			next({ name, message });
		}
	}
);

module.exports = { routineActivitiesRouter };
