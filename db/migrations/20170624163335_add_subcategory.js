exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('items', function (table) {
      table.string('subcategory')
    })

  ])

};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.table('items', function (table) {
      table.dropColumn('subcategory');
    })

  ])
};
