/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('Analysis', function(table) {
        table.string('gameId');
        table.integer('userId');
        table.increments('analysisId').primary();
      });
      
      await knex.schema.createTable('Placement', function(table) {
          table.increments('placementId').primary();
          table.integer('score').notNullable();
          table.string('tilesToPlace').notNullable();
          table.boolean('isHorizontal').notNullable();
          table.integer('row').notNullable();
          table.integer('column').notNullable();
        });

    await knex.schema.createTable('CriticalMoment', function(table) {
        table.increments('criticalMomentId').primary();
        table.string('tiles').notNullable();
        table.enu('actionType', ['placer', 'échanger', 'passer']).notNullable();
        table.string('board').notNullable();
        table.integer('playedPlacementId').unsigned();
        table.integer('bestPlacementId').unsigned();
        table.integer('analysisId').unsigned();
        table.foreign('playedPlacementId').references('placementId').inTable('Placement');
        table.foreign('bestPlacementId').references('placementId').inTable('Placement');
        table.foreign('analysisId').references('analysisId').inTable('Analysis');
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('CriticalMoment');
    await knex.schema.dropTableIfExists('Placement');
    await knex.schema.dropTableIfExists('Analysis');
};
