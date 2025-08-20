/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("casos").del();
  await knex("casos").insert([
    {
      id: 1,
      titulo: "homicidio",
      descricao:
        "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
      status: "aberto",
      agente_id: 2,
    },
    {
      id: 2,
      titulo: "asasinato",
      descricao:
        "Um homen foi esfaquedo às 00:30 do dia 20/10/2008, resultando na morte da vítima, um homem de 20 anos.",
      status: "aberto",
      agente_id: 1,
    }
  ]);
};
