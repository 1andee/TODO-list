exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({email: 'test@test.com', password: 'test'}),
        knex('users').insert({id: 2, name: 'Bob'}),
        knex('users').insert({id: 3, name: 'Charlie'}),
      ]);
    });
};
