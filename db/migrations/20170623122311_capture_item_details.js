exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('items', function (table) {
      table.string('comment')
      table.string('description')
      table.string('thumbnail')
    })

  ])

};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('items', function (table) {
      table.dropColumn('comment');
      table.dropColumn('description');
      table.dropColumn('thumbnail');
    })

  ])
};
