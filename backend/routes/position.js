const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const positionController = require("../controllers/positionController");

router.get("/", authenticateToken, positionController.getAllPositions);
router.get("/:posId", authenticateToken, positionController.getPositionById);
router.post("/", authenticateToken, positionController.createPosition);
router.put("/:posId", authenticateToken, positionController.updatePosition);
router.delete("/:posId", authenticateToken, positionController.deletePosition);

module.exports = router;
