const client = require("./client");

const {
  getUserByUsername
} = require("./users");

const {
  attachActivitiesToRoutines
} = require("./activities");


async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    console.log("Adding new routine")
    const { rows: [routines] } = await client.query (`
    INSERT INTO routines("creatorId", "isPublic", name, goal) 
    VALUES($1, $2, $3, $4) 
    RETURNING *;
    `, [creatorId, isPublic, name, goal]);
  
    console.log("Finished adding new routine")
    return routines;
    } catch (error) {
      console.log("Error creating new routine")
      throw error;
    }
}

async function getRoutineById(id) {
  try {
    console.log("Finding routine")
    const { rows } = await client.query(`
    SELECT *
    FROM routines
    WHERE id=$1;
    `, [id]);

    console.log('routine');
    return rows[0];

  } catch (error) {
    console.log("Error finding routine")
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  
  try {
    console.log("Getting all routines")
    const { rows } = await client.query(`
    SELECT *
    FROM routines;
    `);

    console.log("Found all routines")
    return rows;
  } catch (error) {
    console.log("Error getting routines")
    throw error;
  }
}

async function getAllRoutines() {
	try {
    console.log("Getting all routines")
		const { rows: routines } = await client.query(
			`select routines.id, "creatorId", "isPublic", name, goal, users.username as "creatorName" from routines 
            left join users on routines."creatorId" = users.id`
		);

		const { rows: rActivities } = await client.query(
			`select * from routine_activities 
            left join activities on routine_activities."activityId" = activities.id`
		);

		return attachActivitiesToRoutines(routines, rActivities);
  } catch (error) {
    console.log("Error getting routines")
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    console.log("Getting all public routines")
		const { rows: routines } = await client.query(
			`select routines.id, "creatorId", "isPublic", name, goal, users.username as "creatorName" from routines 
            left join users on routines."creatorId" = users.id 
            where "isPublic"=true`
		);

		const { rows: rActivities } = await client.query(
			`select * from routine_activities 
            left join activities on routine_activities."activityId" = activities.id`
		);

		return attachActivitiesToRoutines(routines, rActivities);
  } catch (error) {
    console.log("Error getting routines")
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    console.log(`Finding routines by user ${username}`)

    const userId = await getUserByUsername(username)

		const { rows: routines } = await client.query(
			`select routines.id, "creatorId", "isPublic", name, goal, users.username as "creatorName" from routines 
            left join users on routines."creatorId" = users.id 
            where "creatorId"=$1;
            `, [userId.id]
		);

		const { rows: rActivities } = await client.query(
			`select * from routine_activities 
            left join activities on routine_activities."activityId" = activities.id`
		);

		return attachActivitiesToRoutines(routines, rActivities);
  } catch (error) {
    console.log("Error finding routines")
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    console.log(`Finding routines by user ${username}`)

    const userId = await getUserByUsername(username)

		const { rows: routines } = await client.query(
			`select routines.id, "creatorId", "isPublic", name, goal, users.username as "creatorName" from routines 
            left join users on routines."creatorId" = users.id 
            where "creatorId"=$1 and "isPublic"=true;
            `, [userId.id]
		);

		const { rows: rActivities } = await client.query(
			`select * from routine_activities 
            left join activities on routine_activities."activityId" = activities.id`
		);

		return attachActivitiesToRoutines(routines, rActivities);

  } catch (error) {
    console.log("Error finding routines")
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
		const { rows: routines } = await client.query(
			`select routines.id, "creatorId", "isPublic", name, goal, users.username as "creatorName" from routines 
            left join users on routines."creatorId" = users.id 
            where "isPublic" = true`
		);

		const { rows: rActivities } = await client.query(
			`select * from routine_activities 
            left join activities on routine_activities."activityId" = activities.id`
		);

		const routinesWithActivities = await attachActivitiesToRoutines(routines, rActivities);

		let routineIdMatch = [];
		routinesWithActivities.forEach(routine => {
			routine.activities.forEach(activity => {
				if (activity.id === id) {
					routineIdMatch.push(routine.id);
				}
			});
		});

		let routinesByActivityId = routinesWithActivities.filter(routine => {
			return routineIdMatch.includes(routine.id);
		});

		console.log(routinesByActivityId);

		return routinesByActivityId;
  } catch (error) {
    console.log("Error finding routines")
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  console.log("Updating routine")
  let {name, isPublic, goal} = fields
	let updateFields = {name, isPublic, goal};

	if (fields.isPublic) {
		updateFields.isPublic = isPublic;
	}
	if (fields.name) {
		updateFields.name = name;
	}
	if (fields.goal) {
		updateFields.goal = goal;
	}

	const setString = Object.keys(updateFields)
		.map((key, i) => {
			return `"${key}"=$${i + 1}`;
		})
		.join(', ');

	try {
		const { rows: [routine] } = await client.query(
			`update routines set ${setString} where id = ${id} returning *`,
			Object.values(updateFields)
		);

		return routine;
  } catch (error) {
    console.log("Error updating activity")
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
		const {
			rows: [deletedRoutine]
		} = await client.query(
			`delete from routines where id = $1 returning *`,
			[id]
		);

		await client.query(
			`delete from routine_activities where "routineId" = $1`,
			[id]
		);

		return deletedRoutine;

  } catch (error) {
    console.log("Error finding routine")
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
