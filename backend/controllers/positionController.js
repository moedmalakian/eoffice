// controllers/positionController.js
const db = require("../configuration/connection");
const moment = require("moment");

// Helper position data formatter
const formatPositionData = (data) => ({
  posId: data.pos_id,
  positionCode: data.position_code,
  positionName: data.position_name,
  createdDate: moment(data.created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.created_by,
});

// Get all positions
exports.getAllPositions = async (req, res) => {
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

  const searchQuery = search
    ? `WHERE position_code LIKE ? OR position_name LIKE ?`
    : "";
  const searchValues = search ? [`%${search}%`, `%${search}%`] : [];

  try {
    // Count
    const countSql = `SELECT COUNT(*) AS totalItems FROM position ${searchQuery}`;
    const [countRows] = await db.query(countSql, searchValues);
    const totalData = countRows[0].totalItems;
    const totalPages = Math.ceil(totalData / limitValue);

    // Data
    const sql = `
      SELECT pos_id, position_code, position_name, created_date, created_by
      FROM position
      ${searchQuery}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [
      ...searchValues,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    const data = rows.map(formatPositionData);

    return res.status(200).json({
      success: true,
      message: "Success fetching positions",
      data,
      totalData,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error fetching positions:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch positions" });
  }
};

// Get position by ID
exports.getPositionById = async (req, res) => {
  const { posId } = req.params;
  if (!posId || isNaN(posId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Position ID" });
  }

  try {
    const sql = `
      SELECT pos_id, position_code, position_name, created_date, created_by
      FROM position
      WHERE pos_id = ?
    `;
    const [rows] = await db.query(sql, [posId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Success fetching position",
      data: formatPositionData(rows[0]),
    });
  } catch (err) {
    console.error("Error fetching position by ID:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch position" });
  }
};

// Create position
exports.createPosition = async (req, res) => {
  const { positionCode, positionName } = req.body;
  const createdBy = req.user?.username || "UNKNOWN";
  const createdDate = new Date();

  try {
    const sql = `
      INSERT INTO position (position_code, position_name, created_date, created_by)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      positionCode,
      positionName,
      createdDate,
      createdBy,
    ]);

    return res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: { posId: result.insertId },
    });
  } catch (err) {
    console.error("Error creating position:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create position" });
  }
};

// Update position
exports.updatePosition = async (req, res) => {
  const { posId } = req.params;
  const { positionCode, positionName } = req.body;

  if (!posId || isNaN(posId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Position ID" });
  }
  if (!positionCode || !positionName) {
    return res
      .status(400)
      .json({ success: false, message: "Position code and name are required" });
  }

  const updatedBy = req.user?.username || "UNKNOWN";
  const updatedDate = new Date();

  try {
    const sql = `
      UPDATE position
      SET position_code = ?, position_name = ?, created_date = ?, created_by = ?
      WHERE pos_id = ?
    `;
    const [result] = await db.query(sql, [
      positionCode,
      positionName,
      updatedDate,
      updatedBy,
      posId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Position updated successfully" });
  } catch (err) {
    console.error("Error updating position:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update position" });
  }
};

// Delete position
exports.deletePosition = async (req, res) => {
  const { posId } = req.params;
  if (!posId || isNaN(posId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Position ID" });
  }

  try {
    const sql = "DELETE FROM position WHERE pos_id = ?";
    const [result] = await db.query(sql, [posId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Position deleted successfully" });
  } catch (err) {
    console.error("Error deleting position:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete position" });
  }
};
