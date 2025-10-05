const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv-flow").config();
const authenticateToken = require("./middleware/authenticateToken");

// Routes
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const divisionRoutes = require("./routes/division");
const positionRoutes = require("./routes/position");
const userRoutes = require("./routes/user");
const roleRoutes = require("./routes/role");
const objectRoutes = require("./routes/object");
const roleObjectRoutes = require("./routes/roleObject");
const referenceRoutes = require("./routes/reference");
const attendanceRoutes = require("./routes/attendance");
const onLeaveRoutes = require("./routes/onLeave");

const app = express();

// Cors Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// API - Routing
// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes
app.use("/api/employee", authenticateToken, employeeRoutes);
app.use("/api/division", authenticateToken, divisionRoutes);
app.use("/api/position", authenticateToken, positionRoutes);
app.use("/api/user", authenticateToken, userRoutes);
app.use("/api/role", authenticateToken, roleRoutes);
app.use("/api/object", authenticateToken, objectRoutes);
app.use("/api/roleObject", authenticateToken, roleObjectRoutes);
app.use("/api/reference", authenticateToken, referenceRoutes);
app.use("/api/attendance", authenticateToken, attendanceRoutes);
app.use("/api/onLeave", authenticateToken, onLeaveRoutes);

// Error Handling: 404
app.use((req, res, next) => {
  const error = new Error("Data Not Found!");
  error.status = 404;
  next(error);
});

// Error Handling: 500
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? error.stack : {},
    },
  });
});

module.exports = app;
