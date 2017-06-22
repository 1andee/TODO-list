
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('items').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('items').insert({user_id: '3', item_name: 'Avengers', completed: 'false', rank: '1', category: 'movie'}),
      ]);
    });
};
