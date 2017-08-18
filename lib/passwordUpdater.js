// Helper function for revising password
const bcrypt = require("bcrypt-nodejs");

function passwordUpdater(user_id, newPassword, knex) {
  return knex('users')
  .returning('user')
  .where({ id: user_id })
  .first()
  .then((user) => {
      return knex('users')
      .where({ id: user_id })
      .update({ password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync()) })
  });
};

module.exports = passwordUpdater;
