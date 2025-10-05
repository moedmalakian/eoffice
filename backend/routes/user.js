const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const userController = require("../controllers/userController");

router.get("/", authenticateToken, userController.getAllUsers);
router.get("/:useId", authenticateToken, userController.getUserById);
router.post("/", authenticateToken, userController.createUser);
router.put("/:useId", authenticateToken, userController.updateUser);
router.delete("/:useId", authenticateToken, userController.deleteUser);

module.exports = router;
