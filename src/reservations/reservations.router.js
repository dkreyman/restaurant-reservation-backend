/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./reservations.controller");
router.route("/:reservation_id/status").put(controller.statusChange);
router
  .route("/:reservation_id")
  .get(controller.readById)
  .put(controller.updateRes);
router
  .route("/")
  .post(controller.create)
  .get(controller.read)
  .all(methodNotAllowed);

// router.route("/").get(controller.read).all(methodNotAllowed);

module.exports = router;
