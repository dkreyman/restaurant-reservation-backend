const knex = require("../db/connection");

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function list(date) {
  return knex("tables").select("*").orderBy("table_name", "asc");
}
function findById(id) {
  return knex("tables").select("*").where({ table_id: id });
}

function update(id, resId) {
  return knex("tables")
    .select("*")
    .where({ table_id: id })
    .update("reservation_id", resId)
    .update("occupied", "occupied");
}

module.exports = {
  create,
  list,
  findById,
  update,
};
