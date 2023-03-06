/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.dropTable('GameHistoryPlayer');

    await knex.schema.createTable('GameHistoryPlayer', async (table) => {
        table.increments('idGameHistoryPlayer').notNullable();
        table.integer('idGameHistory').notNullable();
        table.integer('idUser');
        table.integer('score').notNullable();
        table.boolean('isVirtualPlayer').notNullable();
        table.boolean('isWinner').notNullable();

        table.primary(['idGameHistory', 'idGameHistoryPlayer']);
        table.foreign('idGameHistory', 'GameHistory', 'idGameHistory');
        table.foreign('idUser').references('idUser').inTable('User');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('GameHistoryPlayer');
    
    await knex.schema.createTable('GameHistoryPlayer', (table) => {
        table.increments('idGameHistoryPlayer').notNullable()
        table.integer('playerIndex').notNullable();
        table.integer('idGameHistory').notNullable();
        table.string('name', 40).notNullable();
        table.integer('score').notNullable();
        table.boolean('isVirtualPlayer').notNullable();
        table.boolean('isWinner').notNullable();

        table.primary(['idGameHistoryPlayer', 'playerIndex', 'idGameHistory']);
        table.foreign('idGameHistory', 'GameHistory', 'idGameHistory');
    });
};
