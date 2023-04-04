const express = require('express');
const routinesRouter = express.Router();
const {
	getAllPublicRoutines,
	createRoutine,
	updateRoutine,
	destroyRoutine
} = require('../db/routines');
const { addActivityToRoutine } = require('../db/routine_activities');
const { requireUser } = require('./require');

routinesRouter.get('/', async (req, res, next) => {
	try {
		const publicRoutines = await getAllPublicRoutines();
		res.send(publicRoutines);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

routinesRouter.post('/', requireUser, async (req, res, next) => {
	const { isPublic, name, goal } = req.body;
	const creatorId = req.user.id;

	try {
		if (creatorId && isPublic && name && goal) {
			const newRoutine = await createRoutine({
				creatorId,
				isPublic,
				name,
				goal
			});
			res.send(newRoutine);
		} else {
			res.send({ message: 'Missing fields' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

routinesRouter.patch('/:routineId', requireUser, async (req, res, next) => {
	const { routineId } = req.params;

	try {
		if (Object.keys(req.body).length === 0) {
			throw Error('No update fields');
		}

		const updateFields = { id: routineId, ...req.body };
		console.log(updateFields);
		const updatedRoutine = await updateRoutine(updateFields);
		res.send(updatedRoutine);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

routinesRouter.delete('/:routineId', requireUser, async (req, res, next) => {
	const { routineId } = req.params;

	try {
		const deletedRoutine = await destroyRoutine(routineId);
		res.send(deletedRoutine);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

routinesRouter.post('/:routineId/activities', async (req, res, next) => {
	const { routineId } = req.params;
	const { activityId, count, duration } = req.body;

	if (!activityId || !count || !duration) {
		res.send({ message: 'Missing fields' });
	}

	try {
		const newRoutineActivity = await addActivityToRoutine({
			routineId,
			activityId,
			count,
			duration
		});
		res.send(newRoutineActivity);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = { routinesRouter };
