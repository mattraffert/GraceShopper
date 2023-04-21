//import { hash } from "bcrypt";
const client = require("./client");
const { compare, hash } = require('bcrypt');


// database functions

// user functions
async function createUser({ email, password }) {
  const SALT_COUNT = 10;
  const hashedPassword = await hash(password, SALT_COUNT)
  try {
    console.log(`Creating new user ${email}...`)
    
    const { rows: [user] } = await client.query (`
    INSERT INTO users(email, password) 
    VALUES($1, $2) 
    ON CONFLICT (email) DO NOTHING 
    RETURNING *;
    `, [email, hashedPassword]);

    delete user.password;
  
    console.log(`Finished creating new user ${email}!`)
    return user;
    } catch (error) {
      console.error(`Error creating new user ${email}!`)
      throw error;
    }
}



async function getUser({ email, password }) {
  
  try {
    console.log(`Getting user ${email}...`)
    const user = await getUserByEmail(email);
		const hashedPass = user.password;
		const match = await compare(password, hashedPass);

		if (match) {
      delete user.password;
      console.log(`Found user ${email}!`, user)
      return user
    }
    
    } catch (error) {
      console.error(`Error getting user ${email}!`)
      throw error;
    }
}

async function getUserById(userId) {
  try {
    console.log(`Getting user by id ${userId}...`)
    const { rows } = await client.query(`
    SELECT *
    FROM users
    WHERE id=$1;
    `, [userId]);

    delete rows[0].email;

    console.log(`Found user by id ${userId}!`);
    return rows[0];

  } catch (error) {
    console.error(`Found user by id ${userId}!`)
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    console.log(`Getting user by username ${email}...`)
    const { rows: [user] } = await client.query (`
    SELECT *
    FROM users
    WHERE email=$1;
    `, [email]);
  
    console.log(`Found user by username ${email}!`)
    return user;
    } catch (error) {
      console.error(`Error getting user by username ${email}!`)
      throw error;
    }
}

async function updateUser({ id, ...fields }) {
  console.log("fields", fields.admin, fields.engineer);
  const origFields = await getUserById(id);
  let newAdmin
  let newEngineer

  try{
    if(fields.admin = undefined) {
      newAdmin = origFields.admin;
    } else {
      newAdmin = fields.admin;
    }

    if(fields.engineer = undefined) {
      newEngineer = origFields.engineer;
    } else {
      newEngineer = fields.engineer;
    }
    const { rows: [ user ] } = await client.query(`
      UPDATE users
      SET admin = $1, engineer = $2
      WHERE id = $3
      RETURNING *;
    `, [newAdmin, newEngineer, id])

    console.log("Sucessfully updated user");
    return user;
  } catch (error) {
    console.log(`Error updating user`)
  } throw error;
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByEmail,
  updateUser
}