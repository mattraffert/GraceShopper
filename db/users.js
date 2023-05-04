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

    console.log(`Found user by id ${userId}!`);
    return rows;

  } catch (error) {
    console.error(`Found user by id ${userId}!`)
    throw error;
  }
}

async function getAllUsers() {
  try {
    const { rows } = await client.query(`
    SELECT *
    FROM users
    `)
    return rows;
  } catch (error) {
    console.log(error)
    throw (error);
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

async function updateUser({ id, engineer, admin }) {
  console.log("fields", admin, engineer);
  const origFields = await getUserById(id);
  let newAdmin
  let newEngineer

  try{
    if(admin == undefined) {
      newAdmin = origFields.admin;
    } else {
      newAdmin = admin;
    }

    if(engineer == undefined) {
      newEngineer = origFields.engineer;
    } else {
      newEngineer = engineer;
    }
    const { rows: [ user ] } = await client.query(`
      UPDATE users
      SET admin=$1, engineer=$2
      WHERE id=$3
      RETURNING *;
    `, [newAdmin, newEngineer, id])

    console.log("Sucessfully updated user");
    return user;
  } catch (error) {
    console.log(`Error updating user`)
    throw error } 
}

async function updateUserAddress({ id, address, aptNum, city, state, zip  }) {
  console.log("fields", address, aptNum, city, state, zip);
  const origFields = await getUserById(id);
  let newAddress
  let newAptNum
  let newCity
  let newState
  let newZip

  try{
    if(address == undefined) {
      newAddress = origFields.address;
    } else {
      newAddress = address;
    }

    if(aptNum == undefined) {
      newAptNum = origFields.aptNum;
    } else {
      newAptNum = aptNum;
    }

    if(city == undefined) {
      newCity = origFields.city;
    } else {
      newCity = city;
    }

    if(state == undefined) {
      newState = origFields.state;
    } else {
      newState = state;
    }

    if(zip == undefined) {
      newZip = origFields.zip;
    } else {
      newZip = zip;
    }

    const { rows: [ user ] } = await client.query(`
      UPDATE users
      SET address=$1, aptNum=$2, city=$3, state=$4, zip=$5
      WHERE id=$6
      RETURNING *;
    `, [newAddress, newAptNum, newCity, newState, zip, id])

    console.log("Sucessfully updated user");
    return user;
  } catch (error) {
    console.log(`Error updating user`)
    throw error } 
}

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  updateUserAddress
}