const client = require("./client");
const {
  getUserById
} = require("./users");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    console.log("Adding new routineactivity")
    const { rows } = await client.query (`
    INSERT INTO routine_activities("routineId", "activityId", count, duration) 
    VALUES($1, $2, $3, $4) 
    RETURNING *;
    `, [  routineId,
      activityId,
      count,
      duration,]);
  
    console.log("Finished adding new routineactivity")
    return rows;
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
    WHERE routineid=$1;
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
    console.log("Deleting routineactivity")
    const { rows } = await client.query(`
    DELETE FROM routine_activities
    WHERE id=$1;
    `, [id]);

    console.log('Deleted routineactivity');
    return rows;

  } catch (error) {
    console.log("Error finding routineactivity")
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  const rouAct = await getRoutineActivityById(routineActivityId);
  const user = await getUserById(userId);

  if (user == rouAct.id) {
    console.log("User created this routineactivity")
    return
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
