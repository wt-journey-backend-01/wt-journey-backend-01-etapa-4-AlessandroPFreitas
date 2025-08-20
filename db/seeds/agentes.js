/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('casos').del(); // depende de agentes
  await knex('agentes').del();

  await knex('agentes').insert([
  {id: 1, nome: 'Daniel', dataDeIncorporacao: '1999-10-09', cargo: 'delegado'},
  {id: 2, nome: 'Alan', dataDeIncorporacao: '2000-01-10', cargo: 'delegado'},
  ]);
};
