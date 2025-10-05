const jwt = require("jsonwebtoken");
const { getUserContext } = require("../utils/userContext");
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header format",
      code: "INVALID_AUTH_HEADER",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!SECRET_KEY) {
    return res.status(500).json({
      success: false,
      message: "Server misconfiguration: SECRET_KEY missing",
      code: "SECRET_KEY_MISSING",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const userContext = await getUserContext(decoded.useId);
    if (!userContext) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    req.user = userContext;
    next();
  } catch (err) {
    console.error("Authenticate token error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired, please login again",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid access token",
      code: "INVALID_TOKEN",
    });
  }
};

module.exports = authenticateToken;
