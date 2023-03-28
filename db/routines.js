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
    INSERT INTO routines(creatorId, isPublic, name, goal) 
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
    const { rows } = await client.query(`
    SELECT 
      users.username,
      routineactivities.id,
      routineactivities.routineid,
      routineactivities.activityid,
      routineactivities.duration,
      routineactivities.count,
      activities.name AS activityname,
      activities.description,
      routines.creatorid,
      routines.ispublic,
      routines.name AS routinename,
      routines.goal
    FROM routines
    JOIN routineactivities
    ON routines.id = routineactivities.id
    JOIN activities
    ON activities.id = routineactivities.id
    JOIN users
    ON routines."creatorid" = users.id;
    `);

    const all = await attachActivitiesToRoutines(rows)
    const noBlank = all.slice(1)
    console.log("YYYYYYYYYYYYYYYYY", rows[1])
    console.log("ZZZZZZZZZZZZZZZZZ", noBlank[1].activities)
    console.log("Found all routines", noBlank)
    return noBlank;
  } catch (error) {
    console.log("Error getting routines")
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    console.log("Getting all public routines")
    const { rows } = await client.query(`
    SELECT 
      users.username,
      routineactivities.id,
      routineactivities.routineid,
      routineactivities.activityid,
      routineactivities.duration,
      routineactivities.count,
      activities.name AS activityname,
      activities.description,
      routines.creatorid,
      routines.ispublic,
      routines.name AS routinename,
      routines.goal
    FROM routines
    JOIN routineactivities
    ON routines.id = routineactivities.id
    JOIN activities
    ON activities.id = routineactivities.id
    JOIN users
    ON routines."creatorid" = users.id
    WHERE ispublic=true;
    `);

    const all = await attachActivitiesToRoutines(rows)
    const noBlank = all.slice(1)
    console.log("YYYYYYYYYYYYYYYYY", rows[1])
    console.log("ZZZZZZZZZZZZZZZZZ", noBlank[1].activities)
    console.log("Found all public routines", noBlank)
    return noBlank;
  } catch (error) {
    console.log("Error getting routines")
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    console.log(`Finding routines by user ${username}`)

    const userId = await getUserByUsername(username)

    const { rows } = await client.query(`
    SELECT 
      users.username,
      routineactivities.id,
      routineactivities.routineid,
      routineactivities.activityid,
      routineactivities.duration,
      routineactivities.count,
      activities.name AS activityname,
      activities.description,
      routines.creatorid,
      routines.ispublic,
      routines.name AS routinename,
      routines.goal
    FROM routines
    JOIN routineactivities
    ON routines.id = routineactivities.id
    JOIN activities
    ON activities.id = routineactivities.id
    JOIN users
    ON routines."creatorid" = users.id
    WHERE "creatorid"=$1;
    `, [userId.id]);

    const all = await attachActivitiesToRoutines(rows)
    const noBlank = all.slice(1)
    console.log("YYYYYYYYYYYYYYYYY", rows[1])
    console.log("ZZZZZZZZZZZZZZZZZ", noBlank[1].activities)
    console.log("Found all routines by user", noBlank)
    return noBlank;

  } catch (error) {
    console.log("Error finding routines")
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    console.log(`Finding routines by user ${username}`)

    const userId = await getUserByUsername(username)

    const { rows } = await client.query(`
    SELECT 
      users.username,
      routineactivities.id,
      routineactivities.routineid,
      routineactivities.activityid,
      routineactivities.duration,
      routineactivities.count,
      activities.name AS activityname,
      activities.description,
      routines.creatorid,
      routines.ispublic,
      routines.name AS routinename,
      routines.goal
    FROM routines
    JOIN routineactivities
    ON routines.id = routineactivities.id
    JOIN activities
    ON activities.id = routineactivities.id
    JOIN users
    ON routines."creatorid" = users.id
    WHERE "creatorid"=$1
    AND "ispublic"=true;
    `, [userId.id]);

    const all = await attachActivitiesToRoutines(rows)
    const noBlank = all.slice(1)
    console.log("YYYYYYYYYYYYYYYYY", rows[1])
    console.log("ZZZZZZZZZZZZZZZZZ", noBlank[1].activities)
    console.log("Found all routines by user", noBlank)
    return noBlank;

  } catch (error) {
    console.log("Error finding routines")
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    console.log("Finding routines")

    const { rows } = await client.query(`
    SELECT 
      users.username,
      routineactivities.id,
      routineactivities.routineid,
      routineactivities.activityid,
      routineactivities.duration,
      routineactivities.count,
      activities.name AS activityname,
      activities.description,
      routines.creatorid,
      routines.ispublic,
      routines.name AS routinename,
      routines.goal
    FROM routines
    JOIN routineactivities
    ON routines.id = routineactivities.id
    JOIN activities
    ON activities.id = routineactivities.id
    JOIN users
    ON routines."creatorid" = users.id
    WHERE activityid=$1
    AND "ispublic"=true;
    `, [id]);

    const all = await attachActivitiesToRoutines(rows)
    const noBlank = all.slice(1)
    console.log("YYYYYYYYYYYYYYYYY", rows[1])
    console.log("ZZZZZZZZZZZZZZZZZ", noBlank[1].activities)
    console.log("Found routines", noBlank)
    return noBlank;

  } catch (error) {
    console.log("Error finding routines")
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  console.log("Updating routine")
  const originalRou = await getRoutineById(id)
  let newName
  let newPublic
  let newGoal

  try {

    if (fields.name == undefined || null) {
      newName = originalRou.name
    } else {
      newName = fields.name
    }

    if (fields.ispublic == undefined || null) {
      newPublic = originalRou.ispublic
    } else {
      newPublic = fields.ispublic
    }

    if (fields.goal == undefined || null) {
      newGoal = originalRou.goal
    } else {
      newGoal = fields.goal
    }

    const { rows: [ routine ] } = await client.query(`
      UPDATE routines
      SET name=$2, "ispublic"=$3, goal=$4
      WHERE id=$1
      RETURNING *;
    `, [id, newName, newPublic, newGoal]);

    console.log("Updated Activity", fields.name, fields.ispublic, fields.goal)

    return routine;
  } catch (error) {
    console.log("Error updating activity")
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    console.log("Deleting routine")
    const { rows } = await client.query(`
    DELETE FROM routines
    WHERE id=$1;
    `, [id]);

    console.log('Deleted Routine');
    return rows;

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
