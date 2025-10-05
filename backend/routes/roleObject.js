const express = require("express");
const router = express.Router();
const roleObjectController = require("../controllers/roleObjectController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/objects", authenticateToken, roleObjectController.getAllObjects);
router.get("/:rolId", authenticateToken, roleObjectController.getRoleObject);
router.post("/", authenticateToken, roleObjectController.createRoleObject);

module.exports = router;
