
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('items').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('items').insert({user_id: '1', item_name: 'Aibud', completed: 'false', rank: '1', category: 'Movies/TVSeries'}),
        knex('items').insert({user_id: '1', item_name: 'Airbud', completed: 'false', rank: '2', category: 'Movies/TVSeries'}),
        knex('items').insert({user_id: '1', item_name: 'Airbud', completed: 'false', rank: '3', category: 'Movies/TVSeries'}),
        knex('items').insert({user_id: '1', item_name: 'Wilbur Mexicana', completed: 'false', rank: '4', category: 'Place'}),
        knex('items').insert({user_id: '1', item_name: 'Avengers', completed: 'true', rank: '5', category: 'Movies/TVSeries'}),
      ]);
    });
};
