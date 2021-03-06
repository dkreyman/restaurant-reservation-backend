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
    const phone = req.query.mobile_number;
    let reservation;
    if (date) {
      reservation = await service.read(date);
    }
    if (phone) {
      reservation = await service.findPhone(phone);
    }
    if (reservation) {
      res.status(200).json({ data: reservation });
    } else {
      next({
        status: 404,
        message: `No reservations found for this date or phone number.`,
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
async function readById(req, res, next) {
  try {
    const { reservation_id } = req.params;
    const reservation = await service.findById(reservation_id);
    if (!reservation.length) {
      return next({
        status: 404,
        message: `Reservations cannot be found for ${reservation_id}.`,
      });
    } else {
      res.status(200).json({ data: reservation[0] });
    }
  } catch (err) {
    console.log(err);
    next({
      status: 500,
      message: `Something went wrong looking for reservations with ${reservation_Id}`,
    });
  }
}

function isValid(req, res, next) {
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  if (req.body.data == undefined) {
    return next({
      status: 400,
      message: `Data is missing.`,
    });
  }
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({
        status: 400,
        message: `Reservation must include a ${field}`,
      });
    }
  }
  if (typeof req.body.data.people !== "number") {
    return next({
      status: 400,
      message: "people is not a number",
    });
  }
  let formatDate =
    req.body.data.reservation_date.slice(5) +
    "-" +
    req.body.data.reservation_date.slice(0, 4);
  let pickedDate = new Date(formatDate);
  let timeFormat = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;
  let dateFormat = /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])*/;
  let formatTime = req.body.data.reservation_time.split(":");
  formatTime[0] = parseInt(formatTime[0]);
  formatTime[1] = parseInt(formatTime[1]);
  let pickedTime = new Date().setHours(formatTime[0], formatTime[1]);
  // Tuesdays Are Closed
  if (pickedDate.getUTCDay() === 2) {
    return next({
      status: 400,
      message: "Tuesdays are closed",
    });
  }
  if (!req.body.data.reservation_time.match(timeFormat)) {
    return next({
      status: 400,
      message: "reservation_time is not type time",
    });
  }
  if (!req.body.data.reservation_date.match(dateFormat)) {
    return next({
      status: 400,
      message: "reservation_date is not type date",
    });
  }
  // // Past Dates - 62991251 is timezone offset for Mountain Time
  if (pickedDate.getTime() <= new Date().getTime() - 62991251) {
    return next({
      status: 400,
      message: "Pick a day in the future",
    });
  }
  // Past Time
  if (
    pickedDate.getTime() <= new Date().getTime() &&
    pickedTime <= new Date().getTime()
  ) {
    return next({
      status: 400,
      message: "That time is in the past",
    });
  }
  //No reservation time is before 10:30 AM.
  // formatTime[0] is hours. formatTime[1] is minutes.
  if (formatTime[0] < 10 || (formatTime[0] === 10 && formatTime[1] < 30)) {
    return next({
      status: 400,
      message: "The reservation time is before 10:30 AM.",
    });
  }
  //No Reservation After 9:30pm
  if (formatTime[0] > 21 || (formatTime[0] === 21 && formatTime[1] > 30)) {
    return next({
      status: 400,
      message: "The reservation time is after 9:30 PM.",
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
function isValidStatus(req, res, next) {
  const { status } = req.body.data;
  if (status === "seated" || status === "finished") {
    return next({
      status: 400,
      message: `status is ${status} not 'booked'`,
    });
  } else {
    return next();
  }
}
async function isValidStatusChange(req, res, next) {
  const { status } = req.body.data;
  const { reservation_id } = req.params;

  const reservation = await service.findById(reservation_id);
  if (!reservation.length) {
    return next({
      status: 404,
      message: `Reservations cannot be found for ${reservation_id}.`,
    });
  }

  if (reservation[0].status == "finished") {
    return next({
      status: 400,
      message: `status is finshed. A finished reservation cannot be updated`,
    });
  }

  if (
    status !== "booked" &&
    status !== "seated" &&
    status !== "finished" &&
    status !== "cancelled"
  ) {
    return next({
      status: 400,
      message: `status ${status} is unknown`,
    });
  } else {
    return next();
  }
}
async function statusChange(req, res, next) {
  try {
    const { reservation_id } = req.params;
    const result = await service.updateStatus(
      reservation_id,
      req.body.data.status
    );
    if (result) {
      res.status(200).json({ data: { status: result[0] } });
    } else {
      return next({
        status: 404,
        message: `Reservations: ${reservation_id} status cannot be updated.`,
      });
    }
  } catch (err) {
    return next({
      status: 500,
      message: `Something went wrong trying to update reservations status`,
    });
  }
}
async function updateRes(req, res, next) {
  try {
    const { reservation_id } = req.params;

    const result = await service.updateReservation(
      reservation_id,
      req.body.data
    );

    if (result) {
      res.status(200).json({ data: result[0] });
    } else {
      return next({
        status: 404,
        message: `Reservations: ${reservation_id} cannot be updated.`,
      });
    }
  } catch (err) {
    return next({
      status: 500,
      message: `Something went wrong trying to update reservation`,
    });
  }
}

async function updateResValidation(req, res, next) {
  try {
    const { reservation_id } = req.params;

    const result = await service.findById(reservation_id);
    if (!result.length) {
      return next({
        status: 404,
        message: `Reservations: ${reservation_id} cannot be found`,
      });
    }
  } catch (err) {
    return next({
      status: 500,
      message: `Something went wrong looking for reservation`,
    });
  }
  return next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: asyncErrorBoundary(read),
  readById: asyncErrorBoundary(readById),
  create: [isValid, isValidStatus, asyncErrorBoundary(create)],
  statusChange: [
    asyncErrorBoundary(isValidStatusChange),
    asyncErrorBoundary(statusChange),
  ],
  updateRes: [
    asyncErrorBoundary(updateResValidation),
    isValid,
    asyncErrorBoundary(updateRes),
  ],
};
