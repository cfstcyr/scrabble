/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ChatHistory', (table) => {
        table.increments('id').primary();
        table.string('message', 256).notNullable();
        table.integer('idChannel').unsigned().notNullable();
        table.integer('idUser').unsigned().notNullable();
        table.timestamp('timeStamp').defaultTo(knex.fn.now());
        table.foreign('idChannel').references('id').inTable('Channel');
        table.foreign('idUser').references('id').inTable('User');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    // Drop ChatHistory table
    return knex.schema.dropTable('ChatHistory');
};
