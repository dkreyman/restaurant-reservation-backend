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
    .whereNot("status", "finished")
    .orderBy("reservation_time", "asc");
}

function findById(id) {
  return knex("reservations").select("*").where({ reservation_id: id });
}

function findPhone(phone) {
  return knex("reservations")
    .select("*")
    .where("mobile_number", "like", `%${phone}%`);
}

function list() {
  return knex("reservations").select("*");
}

function updateStatus(id, status) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: id })
    .update("status", status);
}

module.exports = {
  create,
  read,
  list,
  findPhone,
  findById,
  updateStatus,
};
