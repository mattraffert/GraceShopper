const client = require("./client");

async function addProductToUser({
    userId,
    productId,
    quantity,
    active
}) {
  try {
    console.log(`Adding new product to user...`)
    const { rows: [ order ] } = await client.query (`
    INSERT INTO orders("userId", "productId", quantity, active) 
    VALUES($1, $2, $3, $4) 
    ON CONFLICT ("userId", "productId") DO NOTHING
    RETURNING *;
    `, [ userId,
        productId,
        quantity,
        active ]);
  
    console.log(`Finished adding product to user!`)
    return order;
    } catch (error) {
      console.error(`Error adding product to user!`)
      throw error;
    }
}

async function getOrderById(id) {
  try {
    console.log(`Finding order by Id ${id}...`)
    const { rows } = await client.query(`
    SELECT *
    FROM orders
    WHERE id=$1;
    `, [id]);

    console.log(`Found order by Id ${id}!`);
    return rows[0];

  } catch (error) {
    console.error(`Error finding order by Id ${id}!`)
    throw error;
  }
}

async function getOrderByUser({ id }) {
  try {
    console.log(`Finding order by user ${id}...`, id)
    const { rows } = await client.query(`
    SELECT *
    FROM orders
    WHERE "userId"=$1;
    `, [id]);

    console.log(`Found order by user ${id}!`, rows);
    return rows;

  } catch (error) {
    console.error(`Error finding order by user ${id}!`)
    throw error;
  }
}

async function updateOrder({ id, ...fields }) {
  console.log(`Updating order ${id, fields}...`)
  const originalOrder = await getOrderById(id)
  let newQuantity
  let newActive

  try {

    if (fields.quantity == undefined || null) {
        newQuantity = originalOrder.quantity
    } else {
        newQuantity = fields.quantity
    }

    if (fields.active == undefined || null) {
        newActive = originalOrder.active
    } else {
        newActive = fields.active
    }

    const { rows: [ order ] } = await client.query(`
      UPDATE orders
      SET quantity=$2, active=$3
      WHERE id=$1
      RETURNING *;
    `, [id, newQuantity, newActive]);

    console.log(`Finished updating order ${id, fields}!`)

    return order;
  } catch (error) {
    console.error(`Error updating order ${id, fields}!`)
    throw error;
  }
}

async function destroyOrder(id) {
  try {
    console.log(`Destroying order ${id}...`)
    const { rows: [deleted] } = await client.query(`
    DELETE 
    FROM orders
    WHERE id=$1
    RETURNING *;
    `, [id]);

    console.log(`Finished destroying order ${id}!`);
    return deleted;

  } catch (error) {
    console.error(`Error destroying order ${id}!`)
    throw error;
  }
}

async function canEditOrder(orderId, userId) {
  try {
  // console.log(`Editing routine activity ${routineActivityId} by ${userId}...`)
  const {rows: [editedOrder] } = await client.query(`
  SELECT * 
  FROM orders
  JOIN users
  ON users.id = 
  order."userId"
  WHERE order.id = $1 
  AND users.id = $2;
  `, [orderId, userId]);
console.log(`Edited order!`)
  return editedOrder
  } catch(error) {
    console.error(`Error editing order!`)
    throw error
  }

}

module.exports = {
    canEditOrder,
    destroyOrder,
    updateOrder,
    getOrderByUser,
    getOrderById,
    addProductToUser
};