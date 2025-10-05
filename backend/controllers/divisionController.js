// controllers/divisionController.js
const db = require("../configuration/connection");
const moment = require("moment");

// Helper division data formatter
const formatDivisionData = (data) => ({
  divId: data.div_id,
  divisionCode: data.division_code,
  divisionName: data.division_name,
  createdDate: moment(data.created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.created_by,
});

// Get all divisions
exports.getAllDivisions = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const currentPage = parseInt(page, 10);
  const limitValue = parseInt(limit, 10);

  const searchQuery = search
    ? `WHERE division_code LIKE ? OR division_name LIKE ?`
    : "";
  const searchValues = search ? [`%${search}%`, `%${search}%`] : [];

  try {
    const countSql = `SELECT COUNT(*) AS totalItems FROM division ${searchQuery}`;
    const [countRows] = await db.query(countSql, searchValues);

    const totalItems = countRows[0].totalItems;
    const totalPages = Math.ceil(totalItems / limitValue);

    const sql = `
      SELECT div_id, division_code, division_name, created_date, created_by
      FROM division
      ${searchQuery}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [
      ...searchValues,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    const data = rows.map(formatDivisionData);

    return res.status(200).json({
      success: true,
      message: "Success get divisions",
      data,
      totalData: totalItems,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error fetching divisions:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve divisions",
    });
  }
};

// Get division by ID
exports.getDivisionById = async (req, res) => {
  const { divId } = req.params;

  try {
    const sql = `
      SELECT div_id, division_code, division_name, created_date, created_by
      FROM division
      WHERE div_id = ?
    `;
    const [rows] = await db.query(sql, [divId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Success get division",
      data: formatDivisionData(rows[0]),
    });
  } catch (err) {
    console.error("Error fetching division by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve division",
    });
  }
};

// Create division
exports.createDivision = async (req, res) => {
  const { divisionCode, divisionName } = req.body;
  const createdBy = req.user?.username || "UNKNOWN";
  const createdDate = new Date();

  try {
    const sql = `
      INSERT INTO division (division_code, division_name, created_date, created_by)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(sql, [divisionCode, divisionName, createdDate, createdBy]);

    return res.status(201).json({
      success: true,
      message: "Division created successfully",
    });
  } catch (err) {
    console.error("Error creating division:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create division",
    });
  }
};

// Update division
exports.updateDivision = async (req, res) => {
  const { divId } = req.params;
  const { divisionCode, divisionName } = req.body;

  try {
    const sql = `
      UPDATE division
      SET division_code = ?, division_name = ?
      WHERE div_id = ?
    `;
    const [result] = await db.query(sql, [divisionCode, divisionName, divId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Division updated successfully",
    });
  } catch (err) {
    console.error("Error updating division:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update division",
    });
  }
};

// Delete division
exports.deleteDivision = async (req, res) => {
  const { divId } = req.params;

  try {
    const sql = `DELETE FROM division WHERE div_id = ?`;
    const [result] = await db.query(sql, [divId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Division deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting division:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete division",
    });
  }
};
