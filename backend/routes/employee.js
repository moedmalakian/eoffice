const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const employeeController = require("../controllers/employeeController");

router.get("/", authenticateToken, employeeController.getAllEmployees);
router.get("/search", authenticateToken, employeeController.searchEmployee);
router.get("/:empId", authenticateToken, employeeController.getEmployeeById);
router.post("/", authenticateToken, employeeController.createEmployee);
router.put("/:empId", authenticateToken, employeeController.updateEmployee);
router.delete("/:empId", authenticateToken, employeeController.deleteEmployee);

module.exports = router;
