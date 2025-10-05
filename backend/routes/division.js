const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const divisionController = require("../controllers/divisionController");

router.get("/", authenticateToken, divisionController.getAllDivisions);
router.get("/:divId", authenticateToken, divisionController.getDivisionById);
router.post("/", authenticateToken, divisionController.createDivision);
router.put("/:divId", authenticateToken, divisionController.updateDivision);
router.delete("/:divId", authenticateToken, divisionController.deleteDivision);

module.exports = router;
