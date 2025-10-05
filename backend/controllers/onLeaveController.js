const db = require("../configuration/connection");
const moment = require("moment");

// Helper on leave data formatter
const formatLeaveRequest = (data) => ({
  onlId: data.onl_id,
  empId: data.emp_id,
  useId: data.use_id,
  posId: data.pos_id,
  divId: data.div_id,
  startDate: moment(data.start_date).format("YYYY-MM-DD"),
  endDate: moment(data.end_date).format("YYYY-MM-DD"),
  qty: data.qty,
  onlType: data.onl_type,
  remarks: data.remarks,
  activity: data.activity,
  status: data.status,
  createdDate: moment(data.created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.created_by,
});

// Get All Leave
exports.getAllLeaveRequests = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const currentPage = parseInt(page, 10);
  const limitValue = parseInt(limit, 10);

  const searchQuery = search
    ? `WHERE emp_id LIKE ? OR onl_type LIKE ? OR remarks LIKE ?`
    : "";
  const searchValues = search
    ? [`%${search}%`, `%${search}%`, `%${search}%`]
    : [];

  try {
    const countSql = `SELECT COUNT(*) AS totalItems FROM on_leave ${searchQuery}`;
    const [countRows] = await db.query(countSql, searchValues);
    const totalItems = countRows[0].totalItems;
    const totalPages = Math.ceil(totalItems / limitValue);

    const sql = `
      SELECT * FROM on_leave
      ${searchQuery}
      ORDER BY created_date DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [
      ...searchValues,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    const data = rows.map(formatLeaveRequest);

    return res.status(200).json({
      success: true,
      message: "Success get leave requests",
      data,
      totalData: totalItems,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error fetching leave requests:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve leave requests",
    });
  }
};

// Create On Leave
exports.createLeaveRequest = async (req, res) => {
  const {
    useId,
    empId,
    posId,
    divId,
    startDate,
    endDate,
    qty,
    onlType,
    activity,
    remarks,
  } = req.body;
  const createdBy = req.user?.username || "UNKNOWN";
  const createdDate = new Date();

  try {
    const sql = `
      INSERT INTO on_leave 
      (use_id, emp_id, pos_id, div_id, start_date, end_date, qty, onl_type, remarks, activity, status, created_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)
    `;
    const [result] = await db.query(sql, [
      useId,
      empId,
      posId,
      divId,
      startDate,
      endDate,
      qty,
      onlType,
      activity,
      remarks,
      createdDate,
      createdBy,
    ]);

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      onlId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating leave request:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create leave request" });
  }
};

// Get On Leave by ID
exports.getLeaveRequestById = async (req, res) => {
  const { onlId } = req.params;

  try {
    const sql = `SELECT * FROM on_leave WHERE onl_id = ?`;
    const [rows] = await db.query(sql, [onlId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Leave request not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Success get leave request",
      data: formatLeaveRequest(rows[0]),
    });
  } catch (err) {
    console.error("Error fetching leave request:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve leave request" });
  }
};

// Update On Leave
exports.updateLeaveRequest = async (req, res) => {
  const { onlId } = req.params;
  const { startDate, endDate, qty, onlType, activity, remarks } = req.body;

  try {
    const sql = `
      UPDATE on_leave
      SET start_date = ?, end_date = ?, qty = ?, onl_type = ?, activity = ?, remarks = ?, activity = 'UPDATE'
      WHERE onl_id = ? AND status = 'DRAFT'
    `;
    const [result] = await db.query(sql, [
      startDate,
      endDate,
      qty,
      onlType,
      activity,
      remarks,
      onlId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found or already processed",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Leave request updated successfully" });
  } catch (err) {
    console.error("Error updating leave request:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update leave request" });
  }
};

// Delete On Leave
exports.deleteLeaveRequest = async (req, res) => {
  const { onlId } = req.params;

  try {
    const sql = `DELETE FROM on_leave WHERE onl_id = ? AND status = 'DRAFT'`;
    const [result] = await db.query(sql, [onlId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found or already approved/rejected",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Leave request deleted successfully" });
  } catch (err) {
    console.error("Error deleting leave request:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete leave request" });
  }
};

// Approval
exports.approveLeaveRequest = async (req, res) => {
  const { onlId } = req.params;
  const { status, remarks } = req.body;
  const approvedBy = req.user?.username || "UNKNOWN";

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const sql = `
      UPDATE on_leave
      SET status = ?, remarks = ?, activity = 'APPROVAL'
      WHERE onl_id = ? AND status = 'PENDING'
    `;
    const [result] = await db.query(sql, [status, remarks, onlId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or already processed",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()}`,
      approvedBy,
    });
  } catch (err) {
    console.error("Error approving leave request:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to process approval" });
  }
};
