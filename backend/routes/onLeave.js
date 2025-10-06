const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const onLeaveController = require("../controllers/onLeaveController");

router.get("/", authenticateToken, onLeaveController.getAllLeaveRequests);
router.post("/", authenticateToken, onLeaveController.createLeaveRequest);
router.get("/:onlId", authenticateToken, onLeaveController.getLeaveRequestById);
router.put("/:onlId", authenticateToken, onLeaveController.updateLeaveRequest);
router.delete(
  "/:onlId",
  authenticateToken,
  onLeaveController.deleteLeaveRequest
);
router.put(
  "/:onlId/approval",
  authenticateToken,
  onLeaveController.approvalLeaveRequest
);

module.exports = router;
