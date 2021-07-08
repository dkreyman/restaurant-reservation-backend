const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
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

module.exports = {
  list: asyncErrorBoundary(list),
  create: [isValid, asyncErrorBoundary(create)],
};
