const knex = require("../db/db");

async function findAll(filters = {}) {
  const query = knex("casos");

  if (filters.agente_id) {
    query.where("agente_id", filters.agente_id);
  }
  if (filters.status) {
    query.where("status", filters.status);
  }
  if (filters.q) {
    query.where(function () {
      this.where("titulo", "ilike", `%${filters.q}%`).orWhere(
        "descricao",
        "ilike",
        `%${filters.q}%`
      );
    });
  }

  return await query.select("*");
}

async function findById(id) {
  return await knex("casos").where({ id }).first();
}

async function newCaso(caso) {
  const inserted = await knex("casos").insert(caso).returning("*");
  if (Array.isArray(inserted) && inserted.length > 0) return inserted[0];

  return await knex("casos")
    .where({
      titulo: caso.titulo,
      descricao: caso.descricao,
      agente_id: caso.agente_id,
    })
    .orderBy("id", "desc")
    .first();
}

async function attCaso(id, updateCaso) {
  const count = await knex("casos").where({ id }).update(updateCaso);
  if (count === 0) return undefined;
  return findById(id);
}

async function partialCaso(id, updateCaso) {
  const count = await knex("casos").where({ id }).update(updateCaso);
  if (count === 0) return undefined;
  return findById(id);
}

async function removeCaso(id) {
  const caso = await findById(id);
  if (!caso) return undefined;
  await knex("casos").where({ id }).del();
  return true;
}

module.exports = {
  findAll,
  findById,
  newCaso,
  attCaso,
  partialCaso,
  removeCaso,
};
