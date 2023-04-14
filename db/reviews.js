const client = require("./client");

async function createReview({
    creatorId,
    itemId,
    title,
    description,
}) {
  try {
    console.log(`Adding new review...`)
    const { rows: [ review ] } = await client.query (`
    INSERT INTO order("creatorId", "itemId", title, description) 
    VALUES($1, $2, $3, $4) 
    ON CONFLICT ("creatorId", "itemId") DO NOTHING
    RETURNING *;
    `, [ creatorId,
        itemId,
        title,
        description ]);
  
    console.log(`Finished adding review!`)
    return review;
    } catch (error) {
      console.error(`Error adding review!`)
      throw error;
    }
}

async function getReviewById(id) {
  try {
    console.log(`Finding review by Id ${id}...`)
    const { rows } = await client.query(`
    SELECT *
    FROM reviews
    WHERE id=$1;
    `, [id]);

    console.log(`Found review by Id ${id}!`);
    return rows[0];

  } catch (error) {
    console.error(`Error finding review by Id ${id}!`)
    throw error;
  }
}

async function getReviewByUser({ id }) {
  try {
    console.log(`Finding review by user ${id}...`, id)
    const { rows } = await client.query(`
    SELECT *
    FROM reviews
    WHERE "creatorId"=$1;
    `, [id]);

    console.log(`Found order by user ${id}!`, rows);
    return rows;

  } catch (error) {
    console.error(`Error finding order by user ${id}!`)
    throw error;
  }
}

async function getReviewByProduct({ id }) {
    try {
      console.log(`Finding review by product ${id}...`, id)
      const { rows } = await client.query(`
      SELECT *
      FROM reviews
      WHERE "itemId"=$1;
      `, [id]);
  
      console.log(`Found review by product ${id}!`, rows);
      return rows;
  
    } catch (error) {
      console.error(`Error finding review by product ${id}!`)
      throw error;
    }
  }

async function updateReview({ id, ...fields }) {
  console.log(`Updating review ${id, fields}...`)
  const originalRev = await getReviewById(id)
  let newTitle
  let newDescription

  try {

    if (fields.title == undefined || null) {
        newTitle = originalRev.title
    } else {
        newTitle = fields.title
    }

    if (fields.description == undefined || null) {
        newDescription = originalRev.description
    } else {
        newDescription = fields.description
    }

    const { rows: [ review ] } = await client.query(`
      UPDATE reviews
      SET title=$2, description=$3
      WHERE id=$1
      RETURNING *;
    `, [id, newTitle, newDescription]);

    console.log(`Finished updating review ${id, fields}!`)

    return review;
  } catch (error) {
    console.error(`Error updating review ${id, fields}!`)
    throw error;
  }
}

async function destroyReview(id) {
  try {
    console.log(`Destroying review ${id}...`)
    const { rows: [deleted] } = await client.query(`
    DELETE 
    FROM reviews
    WHERE id=$1
    RETURNING *;
    `, [id]);

    console.log(`Finished destroying review ${id}!`);
    return deleted;

  } catch (error) {
    console.error(`Error destroying review ${id}!`)
    throw error;
  }
}

async function canEditReview(reviewId, userId) {
  try {
  // console.log(`Editing routine activity ${routineActivityId} by ${userId}...`)
  const {rows: [editedReview] } = await client.query(`
  SELECT * 
  FROM reviews
  JOIN users
  ON users.id = 
  reviews."creatorId"
  WHERE reviews.id = $1 
  AND users.id = $2;
  `, [reviewId, userId]);
console.log(`Edited review!`)
  return editedReview
  } catch(error) {
    console.error(`Error editing review!`)
    throw error
  }

}

module.exports = {
    createReview,
    getReviewById,
    getReviewByUser,
    getReviewByProduct,
    updateReview,
    destroyReview,
    canEditReview,
};