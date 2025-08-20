/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("agentes", (table) => {
    table.increments("id").primary();
    table.string("nome").notNullable().unique();
    table.date("dataDeIncorporacao").notNullable();
    table.string("cargo").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('agentes');
};
