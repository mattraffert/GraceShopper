const client = require("./client");

const {
  getUserByUsername
} = require("./users");

const {
  attachActivitiesToRoutines
} = require("./activities");


async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    console.log("Creating new routine...")
    const { rows: [routines] } = await client.query (`
    INSERT INTO routines("creatorId", "isPublic", name, goal) 
    VALUES($1, $2, $3, $4) 
    RETURNING *;
    `, [creatorId, isPublic, name, goal]);
  
    console.log("Finished creating new routine!")
    return routines;
    } catch (error) {
      console.error("Error creating new routine!")
      throw error;
    }
}

async function getRoutineById(id) {
  try {
    console.log(`Finding routine by id ${id}...`)
    const { rows } = await client.query(`
    SELECT *
    FROM routines
    WHERE id=$1;
    `, [id]);

    console.log(`Found routine by id ${id}!`);
    return rows[0];

  } catch (error) {
    console.error(`Error finding routine by id ${id}!`)
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  
  try {
    console.log("Getting routines without activities...")
    const { rows } = await client.query(`
    SELECT *
    FROM routines;
    `);

    console.log("Found routines without activities!")
    return rows;
  } catch (error) {
    console.error("Error getting routines without activities!")
    throw error;
  }
}

async function getAllRoutines() {
  try {
    console.log("Getting all routines...")
    const { rows: routines } = await client.query(`
      SELECT routines.*, 
      users.username 
      AS "creatorName" 
      FROM routines 
      LEFT JOIN users 
      ON routines."creatorId" = users.id
      `);

    console.log("Found all routines!");
		return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error("Error getting all routines!")
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    console.log("Getting all public routines...")
    const { rows: routines } = await client.query(`
      SELECT routines.*, 
      users.username 
      AS "creatorName" 
      FROM routines 
      LEFT JOIN users 
      ON routines."creatorId" = users.id 
      WHERE "isPublic" = true
      `);

      console.log("Found all public routines!")
    return attachActivitiesToRoutines(routines)
  } catch (error) {
    console.error("Error getting all public routines!")
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    console.log(`Finding routines by user ${username}...`)
    const userId = await getUserByUsername(username)
    const { rows: routines } = await client.query(`
      SELECT routines.id, 
      "creatorId", "isPublic", 
      name, goal, users.username 
      AS "creatorName" 
      FROM routines 
      LEFT JOIN users 
      ON routines."creatorId" = users.id 
      WHERE "creatorId"=$1;
      `, [userId.id]);

		const { rows: rActivities } = await client.query(`
      SELECT * 
      FROM routine_activities 
      LEFT JOIN activities 
      ON routine_activities."activityId" = activities.id
      `);
    console.log(`Found all routines by user ${username}!`);
		return attachActivitiesToRoutines(routines, rActivities);

  } catch (error) {
    console.error(`Error finding routines by user ${username}!`)
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    console.log(`Finding public routines by user ${username}...`)

    const userId = await getUserByUsername(username)
    const { rows: routines } = await client.query(`
      SELECT routines.id, 
      "creatorId", "isPublic", 
      name, goal, users.username 
      AS "creatorName" 
      FROM routines 
      LEFT JOIN users 
      ON routines."creatorId" = users.id 
      WHERE "creatorId"=$1 
      AND "isPublic"=true;
      `, [userId.id]);

		const { rows: rActivities } = await client.query(`
      SELECT * 
      FROM routine_activities 
      LEFT JOIN activities 
      ON routine_activities."activityId" = activities.id
      `);
    console.log(`Found all public routines by user ${username}!`)
    return attachActivitiesToRoutines(routines, rActivities);

  } catch (error) {
    console.error(`Error finding public routines by user ${username}`)
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    console.log(`Finding public routines by activity ${id}...`)
    const { rows: routines } = await client.query(`
      SELECT routines.id, "creatorId", 
      "isPublic", name, goal, users.username 
      AS "creatorName" 
      FROM routines 
      LEFT JOIN users 
      ON routines."creatorId" = users.id 
      WHERE "isPublic" = true
      `);

		const { rows: rActivities } = await client.query(`
      SELECT * 
      FROM routine_activities 
      LEFT JOIN activities 
      ON routine_activities."activityId" = activities.id
      `);

		const routinesWithActivities = 
    await attachActivitiesToRoutines(routines, rActivities);

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
    console.log(`Found public routines by activity ${id}!`)
    
    return routinesByActivityId;
  } catch (error) {
    console.error(`Error finding public routines by activity ${id}!`)
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {

	const setString = Object.keys(fields)
		.map((key, i) => {
			return `"${key}"=$${i + 1}`;
		})
		.join(', ');
  if (setString.length === 0) {
    console.error(`Errrrrr`)
    return
  }
	try {
		const { rows: [routine] } = await client.query(`
      UPDATE routines 
      SET ${setString} 
      WHERE id = ${id} 
      RETURNING *
      `, Object.values(fields));

    console.log(`Updated routine ${id, fields}!`)

    return routine;
  } catch (error) {
    console.error(`Error updating routine ${id, fields}!`)
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    // console.log(`Destroying routine by id ${id}...`)
    
    await client.query(`
      DELETE FROM routine_activities 
      WHERE "routineId" = $1
      RETURNING *;
      `, [id]);
    const { rows: [deletedRoutine] } = await client.query(`
    DELETE FROM routines
    WHERE id=$1
    RETURNING *;
    `, [id]);

    console.log(`Destroyed routine by id ${id}!`);
    return deletedRoutine;

  } catch (error) {
    console.error(`Error destroying routine by id ${id}!`)
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