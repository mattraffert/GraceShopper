//import { hash } from "bcrypt";
const client = require("./client");
const { compare, hash } = require('bcrypt');


// database functions

// user functions
async function createUser({ username, password }) {
  const SALT_COUNT = 10;
  const hashedPassword = await hash(password, SALT_COUNT)
  try {
    console.log(`Creating new user ${username}...`)
    
    const { rows: [user] } = await client.query (`
    INSERT INTO users(username, password) 
    VALUES($1, $2) 
    ON CONFLICT (username) DO NOTHING 
    RETURNING *;
    `, [username, hashedPassword]);

    delete user.password;
  
    console.log(`Finished creating new user ${username}!`)
    return user;
    } catch (error) {
      console.error(`Error creating new user ${username}!`)
      throw error;
    }
}



async function getUser({ username, password }) {
  
  try {
    console.log(`Getting user ${username}...`)
    const user = await getUserByUsername(username);
		const hashedPass = user.password;
		const match = await compare(password, hashedPass);

		if (match) {
      delete user.password;
      console.log(`Found user ${username}!`, user)
      return user
    }
    
    } catch (error) {
      console.error(`Error getting user ${username}!`)
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

    delete rows[0].password;

    console.log(`Found user by id ${userId}!`);
    return rows[0];

  } catch (error) {
    console.error(`Found user by id ${userId}!`)
    throw error;
  }
}

async function getUserByUsername(userName) {
  try {
    console.log(`Getting user by username ${userName}...`)
    const { rows: [user] } = await client.query (`
    SELECT *
    FROM users
    WHERE username=$1;
    `, [userName]);
  
    console.log(`Found user by username ${userName}!`)
    return user;
    } catch (error) {
      console.error(`Error getting user by username ${userName}!`)
      throw error;
    }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}