const moment = require("moment");
const bcrypt = require("bcrypt");
const db = require("../configuration/connection");

// Helper user data formatter
const formatUserData = (data) => ({
  useId: data.use_id,
  username: data.username,
  empId: data.emp_id,
  fullName: data.fullname,
  email: data.email,
  password: data.password,
  rolId: data.rol_id,
  roleName: data.role_name,
  divId: data.div_id,
  divisionCode: data.division_code,
  divisionName: data.division_name,
  posId: data.pos_id,
  positionCode: data.position_code,
  positionName: data.position_name,
  status: data.status,
  createdDate: moment(data.created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.created_by,
});

// Get all users
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const currentPage = parseInt(page, 10);
  const limitValue = parseInt(limit, 10);

  if (isNaN(currentPage) || currentPage <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid page number. Page must be a positive integer.",
    });
  }

  if (isNaN(limitValue) || limitValue <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid limit value. Limit must be a positive integer.",
    });
  }

  const searchQuery = search
    ? `WHERE u.username LIKE ? OR e.fullname LIKE ? OR u.email LIKE ? OR r.role_name LIKE ? OR d.division_code LIKE ? OR p.position_code LIKE ? OR p.position_name LIKE ? OR d.division_name LIKE ?`
    : "";
  const searchValues = search ? Array(8).fill(`%${search}%`) : [];

  try {
    const countSql = `
      SELECT COUNT(*) AS totalItems 
      FROM user u
      LEFT JOIN employee e ON u.emp_id = e.emp_id
      LEFT JOIN role r ON u.rol_id = r.rol_id
      LEFT JOIN division d ON e.div_id = d.div_id
      LEFT JOIN position p ON e.pos_id = p.pos_id
      ${searchQuery}
    `;
    const [countResult] = await db.query(countSql, searchValues);

    const totalData = countResult[0].totalItems;
    const totalPages = Math.ceil(totalData / limitValue);

    const sql = `
      SELECT 
        u.use_id, u.username, u.emp_id, e.fullname, u.email, 
        u.password, u.rol_id, r.role_name, d.div_id, d.division_code, d.division_name, 
        p.position_code, p.position_name, 
        u.status, u.created_date, u.created_by
      FROM user u
      LEFT JOIN employee e ON u.emp_id = e.emp_id
      LEFT JOIN role r ON u.rol_id = r.rol_id
      LEFT JOIN division d ON e.div_id = d.div_id
      LEFT JOIN position p ON e.pos_id = p.pos_id
      ${searchQuery}
      LIMIT ? OFFSET ?
    `;
    const [results] = await db.query(sql, [
      ...searchValues,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    const data = results.map(formatUserData);

    return res.status(200).json({
      success: true,
      message: "Success get users",
      data,
      totalData,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error get users:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { useId } = req.params;

  if (!useId || isNaN(useId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID",
    });
  }

  try {
    const sql = `
      SELECT 
        u.use_id, u.username, u.emp_id, e.fullname, u.email, 
        u.password, u.rol_id, r.role_name, d.div_id, d.division_code, d.division_name, p.pos_id,
        p.position_code, p.position_name, 
        u.status, u.created_date, u.created_by
      FROM user u
      LEFT JOIN employee e ON u.emp_id = e.emp_id
      LEFT JOIN role r ON u.rol_id = r.rol_id
      LEFT JOIN division d ON e.div_id = d.div_id
      LEFT JOIN position p ON e.pos_id = p.pos_id
      WHERE u.use_id = ?
    `;

    const [results] = await db.query(sql, [useId]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const data = formatUserData(results[0]);

    return res.status(200).json({
      success: true,
      message: "Success get user",
      data,
    });
  } catch (err) {
    console.error("Error get user by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

// Create user
exports.createUser = async (req, res) => {
  const { username, empId, email, password, rolId, status } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email, and password are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdBy = req.user?.username || "UNKNOWN";
    const createdDate = new Date();

    const sql = `
      INSERT INTO user (username, emp_id, email, password, rol_id, status, created_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      username,
      empId,
      email,
      hashedPassword,
      rolId,
      status,
      createdDate,
      createdBy,
    ]);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { useId: result.insertId },
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { useId } = req.params;
  const { username, empId, email, password, rolId, status } = req.body;

  if (!useId || isNaN(useId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID",
    });
  }

  if (!username || !email) {
    return res.status(400).json({
      success: false,
      message: "Username and email are required",
    });
  }

  try {
    let sql = "";
    let params = [];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = `
        UPDATE user 
        SET username = ?, emp_id = ?, email = ?, password = ?, rol_id = ?, status = ?
        WHERE use_id = ?
      `;
      params = [username, empId, email, hashedPassword, rolId, status, useId];
    } else {
      sql = `
        UPDATE user 
        SET username = ?, emp_id = ?, email = ?, rol_id = ?, status = ?
        WHERE use_id = ?
      `;
      params = [username, empId, email, rolId, status, useId];
    }

    const [result] = await db.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { useId } = req.params;

  if (!useId || isNaN(useId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID",
    });
  }

  try {
    const sql = "DELETE FROM user WHERE use_id = ?";
    const [result] = await db.query(sql, [useId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
