/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.alterTable('UserStatistics', (table) => {
        table.integer('rating').notNullable().defaultTo(1000);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("UserStatistics", (table) => {
        table.dropColumn("rating");
    });
};
