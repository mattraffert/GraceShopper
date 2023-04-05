const express = require('express');
const activitiesRouter = express.Router();
const {
	getAllActivities,
	createActivity,
	updateActivity
} = require('../db/activities');
const { getPublicRoutinesByActivity } = require('../db/routines');
const { requireUser } = require('./require');
const { getActivityByName, getActivityById } = require('../db/activities.js');

activitiesRouter.get('/', async (req, res, next) => {
	try {
		const allActivities = await getAllActivities();

		if (allActivities) {
			res.send(allActivities);
		} else {
			res.send({ message: 'No activities found' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

activitiesRouter.post('/', requireUser, async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const exists = await getActivityByName(name)

		if (exists) {
			next({ 
				error: "Name already exists",
				message: `An activity with name ${name} already exists`,
				name: "Error"
			});
		}

		if (name && description) {
			const newActivity = await createActivity({ name, description });
			res.send(newActivity);
		} else {
			res.send({ message: 'Missing fields' });
		}

	} catch ({ name, message }) {
		next({ name, message });
	}
});

activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
	const { name, description } = req.body;
	const { activityId } = req.params;
	const existsId = await getActivityById(activityId)
	const existsName = await getActivityByName(name)

	try {

		if (!existsId) {
			res.send({ 
				error: "No activity",
				message: `Activity ${activityId} not found`,
				name: "Error"
			});
		}

		if (existsName) {
			res.send({ 
				error: "Name already exists",
				message: `An activity with name ${name} already exists`,
				name: "Error"
			});
		}

		if (activityId || name || description) {
			const updatedActivity = await updateActivity({
				id: activityId,
				name,
				description
			});
			res.send(updatedActivity);
		} else {
			res.send({ message: 'Missing fields' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
	const { activityId } = req.params;
	const id = parseInt(activityId);
	const existsId = await getActivityById(activityId)

	try {
		const routinesByActivity = await getPublicRoutinesByActivity({ id });

		if (!existsId) {
			res.send({ 
				error: "No activity",
				message: `Activity ${activityId} not found`,
				name: "Error"
			});
		}

		if (routinesByActivity.length > 0) {
			res.send(routinesByActivity);
		} else {
			res.send({ message: 'No matching routines found' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = { activitiesRouter };
