exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({email: 'David_Chasteau@gmail.com', password: 'lighthouselabs'}),
        // knex('users').insert({id: 2, name: 'Bob'}),
        // knex('users').insert({id: 3, name: 'Charlie'}),
      ]);
    });
};
