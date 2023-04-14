module.exports = {
  ...require('./client'), // adds key/values from users.js
  ...require('./users'), // adds key/values from users.js
  ...require('./order'), // adds key/values from activites.js
  ...require('./products'), // etc
  ...require('./reviews') // etc
}