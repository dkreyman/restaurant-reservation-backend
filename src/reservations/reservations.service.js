const knex = require("../db/connection");

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function read(date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date: date })
    .first();
}

function list() {
  return knex("reservations").select("*");
}
module.exports = {
  create,
  read,
  list,
};
