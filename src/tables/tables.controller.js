const service = require("./tables.service");
const serviceRes = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const { response } = require("express");
/**
 * List handler for reservation resources
 */
async function list(req, res, next) {
  try {
    const reservation = await service.list();
    if (reservation) {
      res.status(200).json({ data: reservation });
    } else {
      next({ status: 404, message: `Tables cannot be found.` });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: "Something went wrong looking for tables",
    });
  }
}

function isValid(req, res, next) {
  const requiredFields = ["table_name", "capacity"];

  if (req.body.data == undefined) {
    return next({
      status: 400,
      message: `Data is missing. Body: ${JSON.stringify(req.body)}`,
    });
  }
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({
        status: 400,
        message: `Table must include a ${field}`,
      });
    }
  }
  if (typeof req.body.data.capacity !== "number") {
    return next({
      status: 400,
      message: "capacity is not a number",
    });
  }
  if (req.body.data.capacity < 1) {
    return next({
      status: 400,
      message: "at least 1 person must be seated at a table",
    });
  }
  if (req.body.data.table_name.length < 2) {
    return next({
      status: 400,
      message: "table_name must be at least 2 characters long",
    });
  }
  return next();
}

async function create(req, res, next) {
  try {
    const result = await service.create(req.body.data);
    if (result) {
      res.status(201).json({ data: result });
    } else {
      next({
        status: 400,
        message: `table cannot be created.`,
      });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong trying to create a table`,
    });
  }
}

async function isValidUpdate(req, res, next) {
  const { table_id } = req.params;
  if (req.body.data == undefined) {
    return next({
      status: 400,
      message: `Data is missing.`,
    });
  }
  if (!req.body.data.reservation_id) {
    return next({
      status: 400,
      message: `Seating request must include a reservation_id`,
    });
  }
  const reservation = await serviceRes.findById(req.body.data.reservation_id);
  if (!reservation) {
    return next({
      status: 404,
      message: `There is no reservation with id: ${req.body.data.reservation_id}`,
    });
  }
  const table = await service.findById(table_id);
  if (!table) {
    return next({
      status: 400,
      message: `There is no table with id: ${table_id}`,
    });
  }
  if (table.occupied == "Occupied") {
    return next({
      status: 400,
      message: `This table is already Occupied`,
    });
  }
  if (reservation.status == "Seated") {
    return next({
      status: 400,
      message: `This party is already seated`,
    });
  }
  if (table.capacity < reservation.people) {
    return next({
      status: 400,
      message: `This table can only hold ${table.capacity} people`,
    });
  }
  return next();
}
async function assignRes(req, res, next) {
  const { reservation_id } = req.body.data;
  const { table_id } = req.params;
  console.log(reservation_id, table_id);
  try {
    const result = await service.update(table_id, reservation_id);
    if (result) {
      res.status(200).json({ data: result });
    } else {
      next({
        status: 404,
        message: `reservation_id could not be assigned for this "table".`,
      });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong updating "table" with id: ${reservation_id}`,
    });
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [isValid, asyncErrorBoundary(create)],
  assignRes: [asyncErrorBoundary(isValidUpdate), asyncErrorBoundary(assignRes)],
};
