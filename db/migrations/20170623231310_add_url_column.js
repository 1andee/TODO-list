exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('items', function (table) {
      table.string('url')
    })

  ])

};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('items', function (table) {
      table.dropColumn('url');
    })

  ])
};
