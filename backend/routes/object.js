const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const objectController = require("../controllers/objectController");

router.get("/", authenticateToken, objectController.getAllObjects);
router.put("/reorder", authenticateToken, objectController.reorderObject);
router.get("/parent", authenticateToken, objectController.getParentObject);
router.get("/menu", authenticateToken, objectController.getMenuObjects);
router.get("/:objId", authenticateToken, objectController.getObjectById);
router.post("/", authenticateToken, objectController.createObject);
router.put("/:objId", authenticateToken, objectController.updateObject);
router.delete("/:objId", authenticateToken, objectController.deleteObject);
router.post("/:objId/copy", authenticateToken, objectController.copyObject);

module.exports = router;
