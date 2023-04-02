const client = require("./client");

const {
  getUserById
} = require("./users");

const {
  getRoutineById
} = require("./routines");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    console.log("Adding new routineactivity")
		const {
			rows: [routineActivity]
		} = await client.query(
			`INSERT INTO routine_activities("routineId", "activityId", count, duration) 
            VALUES($1, $2, $3, $4) RETURNING *`,
			[routineId, activityId, count, duration]
		);

		return routineActivity;
    } catch (error) {
      console.log("Error creating new routineactivity")
      throw error;
    }
}

async function getRoutineActivityById(id) {
  try {
    console.log("Finding routineactivity")
    const { rows } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE id=$1;
    `, [id]);

    console.log('Routineactivity');
    return rows[0];

  } catch (error) {
    console.log("Error finding routineactivity")
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    console.log("Finding routineactivity")
    const { rows } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId"=$1;
    `, [id]);

    console.log('Routineactivity');
    return rows;

  } catch (error) {
    console.log("Error finding routineactivity")
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  console.log("Updating routineactivity")
  const originalRouAct = await getRoutineActivityById(id)
  let newDuration
  let newCount


  try {

    if (fields.duration == undefined || null) {
      newDuration = originalRouAct.duration
    } else {
      newDuration = fields.duration
    }

    if (fields.count == undefined || null) {
      newCount = originalRouAct.count
    } else {
      newCount = fields.count
    }


    const { rows: [ routineactivity ] } = await client.query(`
      UPDATE routine_activities
      SET duration=$2, count=$3
      WHERE id=$1
      RETURNING *;
    `, [id, newDuration, newCount]);

    console.log("Updated routineactivity", fields.duration, fields.count)

    return routineactivity;
  } catch (error) {
    console.log("Error updating routineactivity")
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
		const {
			rows: [deleted]
		} = await client.query(
			`delete from routine_activities where id = $1 returning *`,
			[id]
		);

		return deleted;

  } catch (error) {
    console.log("Error finding routineactivity")
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  const rouAct = await getRoutineActivityById(routineActivityId);
  const rouId = await getRoutineById(rouAct.routineId)
  const user = await getUserById(userId);

  console.log("AAAAAAAAAAA", rouAct, rouId, user)
  console.log("BBBBBBBBBBB", user.id, rouId.creatorId)

  if (user.id == rouId.creatorId) {
    console.log("User created this routineactivity")
    return true;
  } else {
    return false;
  }

}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
