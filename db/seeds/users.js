exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({id: 1, email: 'David_Chasteau@gmail.com', password: 'lighthouselabs', created_at: '06/22/2017', updated_at: '06/22/2017'}),
        // knex('users').insert({id: 2, name: 'Bob'}),
        // knex('users').insert({id: 3, name: 'Charlie'}),
        //knex('users').del()
      ]);
    });
};
