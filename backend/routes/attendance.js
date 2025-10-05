const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const attendanceController = require("../controllers/attendanceController");

router.get("/daily", attendanceController.daily);
router.post("/clockIn", authenticateToken, attendanceController.clockIn);
router.put(
  "/clockOut/:attId",
  authenticateToken,
  attendanceController.clockOut
);
router.put(
  "/correction/:attId",
  authenticateToken,
  attendanceController.correction
);
router.put(
  "/approval/:attId",
  authenticateToken,
  attendanceController.approval
);
router.get("/search", authenticateToken, attendanceController.search);
router.post("/history", authenticateToken, attendanceController.history);

module.exports = router;
