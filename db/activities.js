const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
    try {
      console.log("Adding new activity")
      const { rows: [activities] } = await client.query (`
      INSERT INTO activities(name, description) 
      VALUES($1, $2) 
      RETURNING *;
      `, [name, description]);
    
      console.log("Finished adding new activity")
      return activities;
      } catch (error) {
        console.log("Error creating new activity")
        throw error;
      }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    console.log("Getting all activities")
    const { rows } = await client.query(`
    SELECT *
    FROM activities;
    `);
    console.log("Found all activities")
    return rows;
  } catch (error) {
    console.log("Error getting activities")
    throw error;
  }
}

async function getActivityById(id) {
  try {
    console.log("Finding activity")
    const { rows } = await client.query(`
    SELECT *
    FROM activities
    WHERE id=$1;
    `, [id]);

    console.log('activity');
    return rows[0];

  } catch (error) {
    console.log("Error finding activity")
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    console.log("Finding activity")
    const { rows: [activity] } = await client.query (`
    SELECT *
    FROM activities
    WHERE name=$1;
    `, [name]);
  
    console.log("Found activity")
    return activity;
    } catch (error) {
      console.log("Error finding activity")
      throw error;
    }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
    const routinesById = [];
    routines.forEach((routine) => {
      if (!routinesById[routine.id]) {
        routinesById[routine.id] = {
          id: routine.id,
          routineid: routine.routineid,
          creatorName: routine.username,
          isPublic: routine.ispublic,
          name: routine.routinename,
          goal: routine.goal,
          activities: [],
        };
      }
      const activity = {
        name: routine.activityname,
        activityid: routine.activityid,
        description: routine.description,
        count: routine.count,
        duration: routine.duration,
        routineid: routine.routineid,
        routineactivityid: routine.id
      };
      routinesById[routine.id].activities.push(activity);
    });
  
    return routinesById;

}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  console.log("Updating activity")
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
      SET name=$2, description=$3 
      WHERE id=$1
      RETURNING *;
    `, [id, newName, newDescription]);

    console.log("Updated Activity", fields.name)

    return activity;
  } catch (error) {
    console.log("Error updating activity")
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
