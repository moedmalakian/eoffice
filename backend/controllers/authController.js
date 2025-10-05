// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../configuration/connection");

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "1h";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";

const generateAccessToken = (payload) =>
  jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRES_IN });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: REFRESH_EXPIRES_IN });

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: (() => {
    return 7 * 24 * 60 * 60 * 1000;
  })(),
};

// Signup
exports.signup = async (req, res) => {
  const { username, password, email } = req.body;

  const createdBy = "SIGNUP";
  const createdDate = new Date();

  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: "Username, password, and email are required.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO user (username, password, email, status, created_date, created_by)
      VALUES (?, ?, ?, 'Y', ?, ?)
    `;

    await db.query(query, [
      username,
      hashedPassword,
      email,
      createdDate,
      createdBy,
    ]);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Sign Up Failed. Please try again later.",
    });
  }
};

// Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      `
      SELECT u.use_id, u.username, u.password, u.rol_id, u.email, u.status,
             r.role_name, e.emp_id, e.fullname AS emp_name, p.pos_id, p.position_name, d.div_id, d.division_name
      FROM user u
      LEFT JOIN role r ON u.rol_id = r.rol_id
      LEFT JOIN employee e ON u.emp_id = e.emp_id
      LEFT JOIN position p ON e.pos_id = p.pos_id
      LEFT JOIN division d ON e.div_id = d.div_id
      WHERE u.username = ? AND u.status = 'Y'
      LIMIT 1
      `,
      [username]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const payload = {
      useId: user.use_id,
      username: user.username,
      rolId: user.rol_id,
    };

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    try {
      await db.query("UPDATE user SET token = ? WHERE use_id = ?", [
        refreshToken,
        user.use_id,
      ]);
    } catch (dbErr) {
      console.error("Failed to persist refresh token to DB:", dbErr);
    }

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      token,
    });
  } catch (err) {
    console.error("Error login:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const providedToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers["x-refresh-token"];

  if (!providedToken) {
    return res.status(401).json({
      success: false,
      code: "TOKEN_MISSING",
      message: "Refresh token required",
    });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(providedToken, REFRESH_SECRET_KEY);
    } catch (verifyErr) {
      if (verifyErr.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Refresh token expired",
        });
      }
      return res.status(403).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid refresh token",
      });
    }

    const useId = decoded.useId;

    const [rows] = await db.query("SELECT token FROM user WHERE use_id = ?", [
      useId,
    ]);
    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid refresh token (user not found)",
      });
    }

    const storedToken = rows[0]?.token;
    if (!storedToken || storedToken !== providedToken) {
      return res.status(403).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Refresh token does not match",
      });
    }

    const newPayload = {
      useId: decoded.useId,
      username: decoded.username,
      rolId: decoded.rolId,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    try {
      await db.query("UPDATE user SET token = ? WHERE use_id = ?", [
        newRefreshToken,
        useId,
      ]);
    } catch (dbErr) {
      console.error("Failed to persist rotated refresh token to DB:", dbErr);
    }

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      token: newAccessToken,
    });
  } catch (err) {
    console.error("Error refreshing token:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to refresh token" });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    res.clearCookie("refreshToken");

    if (refreshToken) {
      try {
        await db.query("UPDATE user SET token = NULL WHERE token = ?", [
          refreshToken,
        ]);
      } catch (dbErr) {
        console.error(
          "Failed to clear refresh token in DB during logout:",
          dbErr
        );
      }
    }

    return res.json({
      success: true,
      message: "Successfully logged out.",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to logout" });
  }
};
