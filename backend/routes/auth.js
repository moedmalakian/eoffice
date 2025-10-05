// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.post("/refreshToken", auth.refreshToken);
router.post("/logout", auth.logout);

module.exports = router;
