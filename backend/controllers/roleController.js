// controllers/roleController.js
const db = require("../configuration/connection");
const moment = require("moment");

// Helper role data formatter
const formatRoleData = (data) => ({
  rolId: data.rol_id,
  roleName: data.role_name,
  createdDate: moment(data.created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.created_by,
});

// Get all roles
exports.getAllRoles = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const currentPage = parseInt(page, 10);
  const limitValue = parseInt(limit, 10);

  if (isNaN(currentPage) || currentPage <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid page number" });
  }
  if (isNaN(limitValue) || limitValue <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid limit value" });
  }

  const searchQuery = search ? `WHERE role_name LIKE ?` : "";
  const searchValues = search ? [`%${search}%`] : [];

  try {
    const countSql = `SELECT COUNT(*) AS totalItems FROM role ${searchQuery}`;
    const [countRows] = await db.query(countSql, searchValues);
    const totalData = countRows[0].totalItems;
    const totalPages = Math.ceil(totalData / limitValue);

    const sql = `
      SELECT rol_id, role_name, created_date, created_by
      FROM role
      ${searchQuery}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [
      ...searchValues,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    const data = rows.map(formatRoleData);

    return res.status(200).json({
      success: true,
      message: "Success fetching roles",
      data,
      totalData,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error fetching roles:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch roles" });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  const { rolId } = req.params;
  if (!rolId || isNaN(rolId)) {
    return res.status(400).json({ success: false, message: "Invalid Role ID" });
  }

  try {
    const sql = `SELECT rol_id, role_name, created_date, created_by FROM role WHERE rol_id = ?`;
    const [rows] = await db.query(sql, [rolId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Success fetching role",
      data: formatRoleData(rows[0]),
    });
  } catch (err) {
    console.error("Error fetching role by ID:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch role" });
  }
};

// Create role
exports.createRole = async (req, res) => {
  const { roleName } = req.body;
  if (!roleName) {
    return res
      .status(400)
      .json({ success: false, message: "Role name is required" });
  }

  const createdBy = req.user?.username || "UNKNOWN";
  const createdDate = new Date();

  try {
    const sql = `INSERT INTO role (role_name, created_date, created_by) VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [roleName, createdDate, createdBy]);

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: { rolId: result.insertId },
    });
  } catch (err) {
    console.error("Error creating role:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create role" });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  const { rolId } = req.params;
  const { roleName } = req.body;

  if (!rolId || isNaN(rolId)) {
    return res.status(400).json({ success: false, message: "Invalid Role ID" });
  }
  if (!roleName) {
    return res
      .status(400)
      .json({ success: false, message: "Role name is required" });
  }

  const updatedBy = req.user?.username || "UNKNOWN";
  const updatedDate = new Date();

  try {
    const sql = `
      UPDATE role
      SET role_name = ?, created_date = ?, created_by = ?
      WHERE rol_id = ?
    `;
    const [result] = await db.query(sql, [
      roleName,
      updatedDate,
      updatedBy,
      rolId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Role updated successfully" });
  } catch (err) {
    console.error("Error updating role:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update role" });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  const { rolId } = req.params;
  if (!rolId || isNaN(rolId)) {
    return res.status(400).json({ success: false, message: "Invalid Role ID" });
  }

  try {
    const sql = `DELETE FROM role WHERE rol_id = ?`;
    const [result] = await db.query(sql, [rolId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    console.error("Error deleting role:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete role" });
  }
};
