// require in the database adapter functions as you write them (createUser, createActivity...)
const client = require("./client")

// const {
//   createUser
// } = require("./users");

// const {
//   createActivity, 
//   getAllActivities
// } = require("./activities");

// const {
//   createRoutine, 
//   getRoutinesWithoutActivities,
// } = require("./routines");

// const {
//   addActivityToRoutine,
// } = require("./routine_activities");

async function dropTables() {
  try{
    console.log("Dropping All Tables...")
  // drop all tables, in the correct order
  await client.query(`
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
  `);
    console.log("Finished dropping tables");
  } catch (error) {
    console.error("Error dropping tables");
    throw error;
  }
}

/*address varchar(255) NOT NULL,
    aptNum INTEGER,
    city TEXT NOT NULL,
    state TEXT NOT NULL, 
    zip INTEGER*/

async function createTables() {
  try{
    console.log("Starting to build tables...")
  // create all tables, in the correct order
  await client.query(`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email varchar(255) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    admin BOOLEAN NOT NULL DEFAULT FALSE,
    engineer BOOLEAN NOT NULL DEFAULT FALSE
    

  );
  CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    title varchar(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price INTEGER,
    inventory INTEGER,
    "petType" TEXT NOT NULL,
    "url" TEXT
  );
  CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users (id),
    "productId" INTEGER REFERENCES products (id),
    quantity INTEGER,
    active BOOLEAN DEFAULT true,
    UNIQUE ("userId", "productId")
  );
  CREATE TABLE reviews(
    id SERIAL PRIMARY KEY,
    "creatorId" INTEGER REFERENCES users (id),
    "itemId" INTEGER REFERENCES products (id),
    title TEXT NOT NULL,
    description TEXT NOT NULL
  );
  `);
    console.log("Finished building tables");
  } catch (error) {
    console.error("Error building tables");
    throw error;
  }
}

/* 

DO NOT CHANGE ANYTHING BELOW. This is default seed data, and will help you start testing, before getting to the tests. 

*/

// async function createInitialUsers() {
//   console.log("Starting to create users...")
//   try {
//     const usersToCreate = [
//       { username: "albert", password: "bertie99" },
//       { username: "sandra", password: "sandra123" },
//       { username: "glamgal", password: "glamgal123" },
//     ]
//     const users = await Promise.all(usersToCreate.map(createUser))

//     console.log("Users created:")
//     console.log(users)
//     console.log("Finished creating users!")
//   } catch (error) {
//     console.error("Error creating users!")
//     throw error
//   }
// }
// async function createInitialActivities() {
//   try {
//     console.log("Starting to create activities...")

//     const activitiesToCreate = [
//       {
//         name: "wide-grip standing barbell curl",
//         description: "Lift that barbell!",
//       },
//       {
//         name: "Incline Dumbbell Hammer Curl",
//         description:
//           "Lie down face up on an incline bench and lift thee barbells slowly upward toward chest",
//       },
//       {
//         name: "bench press",
//         description: "Lift a safe amount, but push yourself!",
//       },
//       { name: "Push Ups", description: "Pretty sure you know what to do!" },
//       { name: "squats", description: "Heavy lifting." },
//       { name: "treadmill", description: "running" },
//       { name: "stairs", description: "climb those stairs" },
//     ]
//     const activities = await Promise.all(activitiesToCreate.map(createActivity))

//     console.log("activities created:")
//     console.log(activities)

//     console.log("Finished creating activities!")
//   } catch (error) {
//     console.error("Error creating activities!")
//     throw error
//   }
// }

// async function createInitialRoutines() {
//   console.log("starting to create routines...")

//   const routinesToCreate = [
//     {
//       creatorId: 2,
//       isPublic: false,
//       name: "Bicep Day",
//       goal: "Work the Back and Biceps.",
//     },
//     {
//       creatorId: 1,
//       isPublic: true,
//       name: "Chest Day",
//       goal: "To beef up the Chest and Triceps!",
//     },
//     {
//       creatorId: 1,
//       isPublic: false,
//       name: "Leg Day",
//       goal: "Running, stairs, squats",
//     },
//     {
//       creatorId: 2,
//       isPublic: true,
//       name: "Cardio Day",
//       goal: "Running, stairs. Stuff that gets your heart pumping!",
//     },
//   ]
//   const routines = await Promise.all(
//     routinesToCreate.map((routine) => createRoutine(routine))
//   )
//   console.log("Routines Created: ", routines)
//   console.log("Finished creating routines.")
// }

// async function createInitialRoutineActivities() {
//   console.log("starting to create routine_activities...")
//   const [bicepRoutine, chestRoutine, legRoutine, cardioRoutine] =
//     await getRoutinesWithoutActivities();
//   const [bicep1, bicep2, chest1, chest2, leg1, leg2, leg3] =
//     await getAllActivities();
//     console.log("AAAAAAAAAAAAAAAAAAAAAAA", bicepRoutine, chestRoutine, legRoutine, cardioRoutine)
//     console.log("AAAAAAAAAAAAAAAAAAAAAAA", bicep1, bicep2, chest1, chest2, leg1, leg2, leg3)
//   const routineActivitiesToCreate = [
//     {
//       routineId: bicepRoutine.id,
//       activityId: bicep1.id,
//       count: 10,
//       duration: 5,
//     },
//     {
//       routineId: bicepRoutine.id,
//       activityId: bicep2.id,
//       count: 10,
//       duration: 8,
//     },
//     {
//       routineId: chestRoutine.id,
//       activityId: chest1.id,
//       count: 10,
//       duration: 8,
//     },
//     {
//       routineId: chestRoutine.id,
//       activityId: chest2.id,
//       count: 10,
//       duration: 7,
//     },
//     {
//       routineId: legRoutine.id,
//       activityId: leg1.id,
//       count: 10,
//       duration: 9,
//     },
//     {
//       routineId: legRoutine.id,
//       activityId: leg2.id,
//       count: 10,
//       duration: 10,
//     },
//     {
//       routineId: legRoutine.id,
//       activityId: leg3.id,
//       count: 10,
//       duration: 7,
//     },
//     {
//       routineId: cardioRoutine.id,
//       activityId: leg2.id,
//       count: 10,
//       duration: 10,
//     },
//     {
//       routineId: cardioRoutine.id,
//       activityId: leg3.id,
//       count: 10,
//       duration: 15,
//     },
//   ]
//   const routineActivities = await Promise.all(
//     routineActivitiesToCreate.map(addActivityToRoutine)
//   )
//   console.log("routine_activities created: ", routineActivities)
//   console.log("Finished creating routine_activities!")
// }

async function rebuildDB() {
  try {
    await dropTables()
    await createTables()
    // await createInitialUsers()
    // await createInitialActivities()
    // await createInitialRoutines()
    // await createInitialRoutineActivities()
  } catch (error) {
    console.log("Error during rebuildDB")
    throw error
  }
}

module.exports = {
  rebuildDB,
  dropTables,
  createTables,
}
