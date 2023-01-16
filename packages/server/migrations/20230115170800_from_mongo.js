/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('GameHistoryPlayer', (table) => {
        table.increments('id').notNullable()
        table.integer('playerIndex').notNullable();
        table.integer('gameHistoryId').notNullable();
        table.string('name', 20).notNullable();
        table.integer('score').notNullable();
        table.boolean('isVirtualPlayer').notNullable();
        table.boolean('isWinner').notNullable();

        table.primary(['id', 'playerIndex', 'gameHistoryId']);
    });

    await knex.schema.createTable('GameHistory', (table) => {
        table.increments('id').notNullable().primary();
        table.dateTime('startTime').notNullable();
        table.dateTime('endTime').notNullable();
        table.string('gameType', 20).notNullable();
        table.string('gameMode', 20).notNullable();
        table.boolean('hasBeenAbandoned').notNullable();
    });

    await knex.schema.createTable('HighScore', (table) => {
        table.increments('id').notNullable().primary();
        table.string('gameType', 20).notNullable();
        table.integer('score').notNullable();
    });

    await knex.schema.createTable('HighScorePlayer', (table) => {
        table.integer('highScoreId').notNullable();
        table.string('name', 20).notNullable();

        table.primary(['highScoreId', 'name']);
        table.foreign('highScoreId').references('id').inTable('HighScore');
    });

    await knex.schema.createTable('VirtualPlayer', (table) => {
        table.increments('id').notNullable().primary();
        table.string('level', 20).notNullable();
        table.boolean('isDefault').notNullable().defaultTo(false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('VirtualPlayer');
    await knex.schema.dropTable('HighScorePlayer');
    await knex.schema.dropTable('HighScore');
    await knex.schema.dropTable('GameHistory');
    await knex.schema.dropTable('GameHistoryPlayer');
};
