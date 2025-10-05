const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const roleController = require("../controllers/roleController");

router.get("/", authenticateToken, roleController.getAllRoles);
router.get("/:rolId", authenticateToken, roleController.getRoleById);
router.post("/", authenticateToken, roleController.createRole);
router.put("/:rolId", authenticateToken, roleController.updateRole);
router.delete("/:rolId", authenticateToken, roleController.deleteRole);

module.exports = router;
