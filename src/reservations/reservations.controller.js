const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
/**
 * List handler for reservation resources
 */
async function list(req, res, next) {
  try {
    const reservation = await service.list();
    if (reservation) {
      res.json({ data: reservation });
    }
    next({ status: 404, message: `Reservations cannot be found for this.` });
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: "Something went wrong looking for reservations",
    });
  }
}
async function read(req, res, next) {
  try {
    const date = req.query.date;
    const reservation = await service.read(date);
    if (reservation) {
      res.json({ data: reservation });
    } else {
      next({
        status: 404,
        message: `Reservations cannot be found for this date: ${date}.`,
      });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong looking for reservations for this date: ${date}`,
    });
  }
}

async function create(req, res, next) {
  try {
    const result = await service.create(req.body);
    if (result) {
      res.json(result);
    } else {
      next({
        status: 400,
        message: `Reservations cannot be created.`,
      });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong trying to create a reservations`,
    });
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: asyncErrorBoundary(read),
  create: asyncErrorBoundary(create),
};
