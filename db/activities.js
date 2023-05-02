const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
    try {
      console.log("Creating new activity...")
      const { rows: [activities] } = await client.query (`
      INSERT INTO activities(name, description) 
      VALUES($1, $2) 
      RETURNING *;
      `, [name, description]);
    
      console.log("Finished creating new activity!")
      return activities;
      } catch (error) {
        console.error("Error creating new activity!")
        throw error;
      }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    console.log("Getting all activities...")
    const { rows } = await client.query(`
    SELECT *
    FROM activities;
    `);
    console.log("Found all activities!")
    return rows;
  } catch (error) {
    console.error("Error getting all activities!")
    throw error;
  }
}

async function getActivityById(id) {
  try {
    console.log(`Getting activity by id ${id}...`)
    const { rows } = await client.query(`
    SELECT *
    FROM activities
    WHERE id=$1;
    `, [id]);

    console.log(`Found activity by id ${id}!`);
    return rows[0];

  } catch (error) {
    console.error(`Error finding activity by id ${id}!`)
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    console.log(`Finding activity by name ${name}...`)
    const { rows: [activity] } = await client.query (`
    SELECT *
    FROM activities
    WHERE name=$1;
    `, [name]);
  
    console.log(`Found activity by name ${name}!`)
    return activity;
    } catch (error) {
      console.error(`Error finding activity by name ${name}!`)
      throw error;
    }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  const routineArray = [...routines];
  const attach = routines.map((routine) => routine.id);
  if (routines.length === 0) {
      return;
  }
  try {
      const { rows: activities } = await client.query(
          `
      SELECT activities.*, routine_activities.duration, routine_activities.count,
      routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${attach
          .map((routineId, index) => "$" + (index + 1))
          .join(",")});
      `,
          attach
      );
      for (const routine of routineArray) {
          const addActivities = activities.filter((activity) => routine.id === activity.routineId);
          routine.activities = addActivities;
      }
      return routineArray;
  } catch (error) {
      console.log("Error attaching activities to routines");
      throw error;
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  console.log(`Updating activity by ${id, fields.name, fields.description}...`)
  const originalAct = await getActivityById(id)
  let newName
  let newDescription

  try {

    if (fields.name == undefined) {
      newName = originalAct.name
    } else {
      newName = fields.name
    }

    if (fields.description == undefined) {
      newDescription = originalAct.description
    } else {
      newDescription = fields.description
    }

    const { rows: [ activity ] } = await client.query(`
      UPDATE activities
      SET name=$2, 
      description=$3 
      WHERE id=$1
      RETURNING *;
    `, [id, newName, newDescription]);

    console.log(`Updated activity by ${id, fields.name, fields.description}!`)

    return activity;
  } catch (error) {
    console.error(`Error updating activity by ${id, fields.name, fields.description}!`)
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};