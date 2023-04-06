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
    console.log(`Adding new activity to routine...`)
    const { rows: [ routineactivity] } = await client.query (`
    INSERT INTO routine_activities("routineId", "activityId", count, duration) 
    VALUES($1, $2, $3, $4) 
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *;
    `, [ routineId,
      activityId,
      count,
      duration ]);
  
    console.log(`Finished adding new activity to routine!`)
    return routineactivity;
    } catch (error) {
      console.error(`Error adding new activity to routine!`)
      throw error;
    }
}

async function getRoutineActivityById(id) {
  try {
    console.log(`Finding routine activity by Id ${id}...`)
    const { rows } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE id=$1;
    `, [id]);

    console.log(`Found routine activity by Id ${id}!`);
    return rows[0];

  } catch (error) {
    console.error(`Error finding routine activity by Id ${id}!`)
    throw error;
  }
}

async function getRoutineActivitiesByRoutine(id) {
  try {
    console.log(`Finding routine activities by routine ${id}...`, id)
    const { rows } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId"=$1;
    `, [id]);

    console.log(`Found routine activities by routine ${id}!`, rows);
    return rows;

  } catch (error) {
    console.error(`Error finding routine activities by routine ${id}!`)
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  console.log(`Updating routine activity ${id, fields}...`)
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

    console.log(`Finished updating routine activity ${id, fields}!`)

    return routineactivity;
  } catch (error) {
    console.error(`Error updating routine activity ${id, fields}!`)
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    console.log(`Destroying routine activity ${id}...`)
    const { rows: [deleted] } = await client.query(`
    DELETE 
    FROM routine_activities
    WHERE id=$1
    RETURNING *;
    `, [id]);

    console.log(`Finished destroying routine activity ${id}!`);
    return deleted;

  } catch (error) {
    console.error(`Error destroying routine activity ${id}!`)
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
  // console.log(`Editing routine activity ${routineActivityId} by ${userId}...`)
  const {rows: [editedroutineAct] } = await client.query(`
  SELECT * 
  FROM routine_activities
  JOIN routines
  ON routines.id = 
  routine_activities."routineId"
  WHERE routine_activities.id = $1 
  AND "creatorId" = $2;
  `, [routineActivityId, userId]);
console.log(`Edited routine activity!`)
  return editedroutineAct
  } catch(error) {
    console.error(`Error editing routine activity!`)
    throw error
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