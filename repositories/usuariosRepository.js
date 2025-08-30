const knex = require("../db/db");

async function buscarPorEmail(email) {
  return await knex("usuarios").where({ email }).first();
}

async function newUsuario(usuario) {
  return await knex("usuarios").insert(usuario).returning("*");
}

async function deleteUsuario(id) {
  return await knex("usuarios").where({ id }).del();
}


module.exports = {
  buscarPorEmail,
  newUsuario,
  deleteUsuario
};
