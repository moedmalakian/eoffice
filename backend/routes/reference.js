const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const referenceController = require("../controllers/referenceController");

router.get("/", authenticateToken, referenceController.getAllReference);
router.post(
  "/referenceList",
  authenticateToken,
  referenceController.getReferenceList
);
router.get("/:rfhId", authenticateToken, referenceController.getReferenceById);
router.get(
  "/code/:referenceCode",
  authenticateToken,
  referenceController.getReferenceByCode
);
router.post("/", authenticateToken, referenceController.createReference);
router.put("/:rfhId", authenticateToken, referenceController.updateReference);
router.delete(
  "/:rfhId",
  authenticateToken,
  referenceController.deleteReference
);

module.exports = router;
