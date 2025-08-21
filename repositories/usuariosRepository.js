const knex = require('../db/db');

async function buscarPorEmail(email) {
    return await knex('usuarios').where({email}).first();
}

async function newUsuario(usuario) {
    const [insert] = await knex('usuarios').insert(usuario).returning("*");

    return insert;
}

module.exports = {
buscarPorEmail
};