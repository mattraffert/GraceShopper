const client = require('./client');

// database functions
async function createProduct({ title , description, price, inventory, petType, url }) {
  // return the new activity
    try {
      console.log("Creating new product...")
      const { rows: [products] } = await client.query (`
      INSERT INTO products(title, description, price, inventory, "petType", "url") 
      VALUES($1, $2, $3, $4, $5, $6) 
      RETURNING *;
      `, [title , description, price, inventory, petType, url]);
    
      console.log("Finished creating new products!")
      return products;
      } catch (error) {
        console.error("Error creating new products!")
        throw error;
      }
}

async function getAllProducts() {
  // select and return an array of all activities
  try {
    console.log("Getting all products...")
    const { rows } = await client.query(`
    SELECT *
    FROM products;
    `);
    console.log("Found all products!")
    return rows;
  } catch (error) {
    console.error("Error getting all products!")
    throw error;
  }
}

async function getProductById(id) {
  try {
    console.log(`Getting product by id ${id}...`)
    const { rows } = await client.query(`
    SELECT *
    FROM products
    WHERE id=$1;
    `, [id]);

    console.log(`Found product by id ${id}!`);
    return rows[0];

  } catch (error) {
    console.error(`Error finding product by id ${id}!`)
    throw error;
  }
}

async function getProductByTitle(title) {
  try {
    console.log(`Finding product by name ${title}...`)
    const { rows: [product] } = await client.query (`
    SELECT *
    FROM products
    WHERE title=$1;
    `, [title]);
  
    console.log(`Found product by name ${title}!`)
    return product;
    } catch (error) {
      console.error(`Error finding product by name ${title}!`)
      throw error;
    }
}

async function getProductByPetType(petType) {
    try {
      console.log(`Finding product by name ${petType}...`)
      const { rows: [Type] } = await client.query (`
      SELECT *
      FROM products
      WHERE "petType"=$1;
      `, [petType]);
    
      console.log(`Found product by name ${petType}!`)
      return Type;
      } catch (error) {
        console.error(`Error finding product by name ${petType}!`)
        throw error;
      }
  }

// used as a helper inside db/routines.js
async function attachProductToUser(user) {
  const userArray = [...user];
  const attach = user.map((user) => user.id);
  if (user.length === 0) {
      return;
  }
  try {
      const { rows: products } = await client.query(
          `
      SELECT products.*, order.quantity, order.active,
      order.id AS "orderId", order."userId"
      FROM products
      JOIN order ON order."productId" = products.id
      WHERE order."userId" IN (${attach
          .map((userId, index) => "$" + (index + 1))
          .join(",")});
      `,
          attach
      );
      for (const user of userArray) {
          const addProducts = products.filter((product) => user.id === product.userId);
          user.products = addProducts;
      }
      return userArray;
  } catch (error) {
      console.log("Error attaching product to user");
      throw error;
  }
}

async function updateProduct({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  console.log(`Updating activity by ${id, fields.title, fields.description, fields.price, fields.inventory, fields.petType, fields.url}...`)
  const originalProd = await getProductById(id)
  let newTitle
  let newDescription
  let newPrice
  let newInventory
  let newPetType
  let newURL

  try {

    if (fields.title == undefined) {
      newTitle = originalProd.title
    } else {
      newTitle = fields.title
    }

    if (fields.description == undefined) {
      newDescription = originalProd.description
    } else {
      newDescription = fields.description
    }

    if (fields.price == undefined) {
        newPrice = originalProd.price
    } else {
        newPrice = fields.price
    }

    if (fields.inventory == undefined) {
        newInventory = originalProd.inventory
    } else {
        newInventory = fields.inventory
    }

    if (fields.petType == undefined) {
        newPetType = originalProd.petType
    } else {
        newPetType = fields.petType
    }

    if (fields.url == undefined) {
      newURL = originalProd.url
    } else {
      newURL = fields.url
    }


    const { rows: [ product ] } = await client.query(`
      UPDATE products
      SET title=$2, 
      description=$3,
      price=$4,
      inventory=$5,
      "petType"=$6 
      url=$7
      WHERE id=$1
      RETURNING *;
    `, [id, newTitle, newDescription, newPrice, newInventory, newPetType, newURL]);

    console.log(`Updated activity by ${id, fields.title, fields.description, fields.price, fields.inventory, fields.petType, newURL}!`)

    return product;
  } catch (error) {
    console.error(`Error updating activity by ${id, fields.title, fields.description, fields.price, fields.inventory, fields.petType, newURL}!`)
    throw error;
  }
}

async function destroyProduct(id) {
    try {
      // console.log(`Destroying routine by id ${id}...`)
      
      await client.query(`
        DELETE FROM order 
        WHERE "productId" = $1
        RETURNING *;
        `, [id]);

    await client.query(`
        DELETE FROM reviews 
        WHERE "productId" = $1
        RETURNING *;
        `, [id]);

      const { rows: [deletedProduct] } = await client.query(`
      DELETE FROM products
      WHERE id=$1
      RETURNING *;
      `, [id]);
  
      console.log(`Destroyed routine by id ${id}!`);
      return deletedProduct;
  
    } catch (error) {
      console.error(`Error destroying routine by id ${id}!`)
      throw error;
    }
  }

module.exports = {
    getAllProducts,
    getProductById,
    getProductByTitle,
    getProductByPetType,
    attachProductToUser,
    createProduct,
    updateProduct,
    destroyProduct
};