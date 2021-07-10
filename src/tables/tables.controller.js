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

async function reservationExists(req, res, next) {
  if (req.body.data === undefined) {
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
  try {
    const reservation = await serviceRes.findById(req.body.data.reservation_id);

    if (!reservation[0]) {
      next({
        status: 404,
        message: `Reservation with ${req.body.data.reservation_id} cannot be found.`,
      });
    } else if (reservation[0].status == "seated") {
      next({
        status: 400,
        message: `Reservation with ${req.body.data.reservation_id} is already seated.`,
      });
    } else {
      res.locals.reservation = reservation;
      return next();
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong looking for reservation_id: ${req.body.data.reservation_id}`,
    });
  }
}
async function tableExists(req, res, next) {
  const { table_id } = req.params;
  if (!table_id) {
    return next({
      status: 400,
      message: `No table_id`,
    });
  }
  try {
    const table = await service.findById(table_id);
    if (table) {
      res.locals.table = table;
      return next();
    } else {
      return next({
        status: 400,
        message: `There is no table with id: ${table_id}`,
      });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong looking for table with id: ${table_id}`,
    });
  }
  return next();
}
async function isValidUpdate(req, res, next) {
  const { table, reservation } = res.locals;

  if (table[0]["occupied"] == "occupied") {
    return next({
      status: 400,
      message: `This table is already occupied`,
    });
  }
  if (table[0]["capacity"] < reservation[0]["people"]) {
    return next({
      status: 400,
      message: `Reached capacity: this table can only hold ${table[0].capacity} people`,
    });
  }
  return next();
}
function isValidResDelete(req, res, next) {
  const { table } = res.locals;
  const { table_id } = req.params;
  if (!table.length) {
    return next({
      status: 404,
      message: `No table_id: ${table_id}`,
    });
  }

  if (table[0]["occupied"] !== "occupied") {
    return next({
      status: 400,
      message: `This table is not occupied`,
    });
  }

  return next();
}
async function assignRes(req, res, next) {
  const { reservation_id } = req.body.data;
  const { table_id } = req.params;
  try {
    const result = await service.update(table_id, reservation_id);
    if (!result) {
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
  try {
    const result = await serviceRes.updateStatus(reservation_id, "seated");
    if (result) {
      res.status(200).json({ data: result });
    } else {
      next({
        status: 404,
        message: `reservation status could not be updated to seated.`,
      });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong updating reservation status could not be updated to seated`,
    });
  }
}

async function deleteRes(req, res, next) {
  // const { reservation_id } = req.body.data;
  const { table_id } = req.params;
  try {
    const result = await service.deleteRes(table_id);
    if (result) {
      res.status(200).json({ data: result });
    } else {
      next({
        status: 404,
        message: `reservation_id could not be deleted for this "table".`,
      });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong deleting "table" reservation with id: ${reservation_id}`,
    });
  }
  return next();
}

async function finishResStatus(req, res, next) {
  try {
    const { table } = res.locals;
    const result = await serviceRes.updateStatus(
      table[0].reservation_id,
      "finished"
    );
    if (!result) {
      next({
        status: 404,
        message: `reservation status could not be updated to finished.`,
      });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong updating reservation status could not be updated to finished`,
    });
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [isValid, asyncErrorBoundary(create)],
  assignRes: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(tableExists),
    isValidUpdate,
    asyncErrorBoundary(assignRes),
  ],
  deleteRes: [
    asyncErrorBoundary(tableExists),
    isValidResDelete,
    asyncErrorBoundary(deleteRes),
    asyncErrorBoundary(finishResStatus),
  ],
};
