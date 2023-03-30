/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.alterTable('UserStatistics', (table) => {
        table.double('rating', 5, 1).notNullable().defaultTo(1000);
    });

    await knex.schema.alterTable('GameHistoryPlayer', (table) => {
        table.double('ratingVariation', 5, 1).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.alterTable("UserStatistics", (table) => {
        table.dropColumn("rating");
    });
    await knex.schema.alterTable("GameHistoryPlayer", (table) => {
        table.dropColumn("rating");
    });
};
