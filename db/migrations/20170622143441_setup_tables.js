exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('users', function (table) {
      table.dropColumn('name');
      table.string('email');
      table.string('password');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    }),

    knex.schema.createTable('items', table => {
      table.increments();
      table.string('user_id');
      table.string('item_name');
      table.boolean('completed');
      table.integer('rank');
      table.string('category');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([

  knex.schema.table('users', function (table) {
    table.string('name');
    table.dropColumn('email');
    table.dropColumn('password');
    table.dropTimestamps();
  }),

  knex.schema.dropTableIfExists('items')

  ])
};
