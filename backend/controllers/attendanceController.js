const db = require("../configuration/connection");
const moment = require("moment");
const { getConfigValue } = require("../utils/reference");

// Formatter attendance
const formatAttendanceData = (data) => ({
  attId: data.att_id,
  useId: data.use_id,
  empId: data.emp_id,
  posId: data.pos_id,
  divId: data.div_id,
  startDate: data.start_date
    ? moment(data.start_date).format("YYYY-MM-DD HH:mm:ss")
    : null,
  endDate: data.end_date
    ? moment(data.end_date).format("YYYY-MM-DD HH:mm:ss")
    : null,
  attendance: data.attendance,
  attType: data.att_type,
  location: data.location,
  latitude: data.latitude,
  longitude: data.longitude,
  remarks: data.remarks,
  activity: data.activity,
  qty: data.qty,
  createdDate: moment(data.created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.created_by,
});

// Formatter for frontend
const formatAttendanceForFrontend = (data) => {
  const startDate = data.start_date ? new Date(data.start_date) : null;
  const endDate = data.end_date ? new Date(data.end_date) : null;
  let hours = 0;

  if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
    const diffMs = Math.abs(endDate - startDate);
    hours = Math.floor(diffMs / (1000 * 60 * 60));
  }

  return {
    attId: data.att_id,
    date: startDate ? moment(startDate).format("DD-MM-YYYY") : "-",
    clockIn: startDate ? moment(startDate).format("HH:mm") : "-",
    clockOut: endDate ? moment(endDate).format("HH:mm") : "-",
    attendance: data.attendance || "-",
    attType: data.att_type || "-",
    location: data.location || "-",
    hours: hours > 0 ? `${hours} Jam` : "-",
    activity: data.activity || "-",
    remarks: data.remarks || "-",
    status: endDate ? "Completed" : "In Progress",
    startDate: startDate
      ? moment(startDate).format("YYYY-MM-DD HH:mm:ss")
      : null,
    endDate: endDate ? moment(endDate).format("YYYY-MM-DD HH:mm:ss") : null,
    latitude: data.latitude,
    longitude: data.longitude,
    fullname: data.fullname || "-",
    division_name: data.division_name || "-",
    position_name: data.position_name || "-",
  };
};

// Helper: check today's attendance
const checkTodayAttendance = async (empId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const sql = `
    SELECT * FROM attendance
    WHERE emp_id = ? AND start_date BETWEEN ? AND ?
    ORDER BY start_date DESC
    LIMIT 1
  `;
  const [rows] = await db.query(sql, [empId, startOfDay, endOfDay]);
  return rows.length > 0 ? rows[0] : null;
};

// Daily
exports.daily = async (req, res) => {
  const { page = 1, limit = 31 } = req.query;
  const currentPage = parseInt(page);
  const limitValue = parseInt(limit);
  const currentUser = req.user;

  if (!currentUser?.empId) {
    return res.json({
      success: true,
      message: "No employee ID found",
      data: [],
      totalData: 0,
      currentPage,
      totalPages: 0,
      limit: limitValue,
    });
  }

  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const countSql = `SELECT COUNT(*) AS totalItems FROM attendance a WHERE a.emp_id = ? AND a.start_date BETWEEN ? AND ?`;
    const [countRows] = await db.query(countSql, [
      currentUser.empId,
      firstDay,
      lastDay,
    ]);
    const totalData = countRows[0].totalItems;
    const totalPages = Math.ceil(totalData / limitValue);

    const sql = `
      SELECT a.*, e.fullname, d.division_name, p.position_name
      FROM attendance a
      LEFT JOIN employee e ON a.emp_id = e.emp_id
      LEFT JOIN division d ON a.div_id = d.div_id
      LEFT JOIN position p ON a.pos_id = p.pos_id
      WHERE a.emp_id = ? AND a.start_date BETWEEN ? AND ?
      ORDER BY a.start_date DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [
      currentUser.empId,
      firstDay,
      lastDay,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    return res.json({
      success: true,
      message: "Daily attendance fetched",
      data: rows.map(formatAttendanceForFrontend),
      totalData,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error daily:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch" });
  }
};

// Clock In
exports.clockIn = async (req, res) => {
  const {
    useId,
    empId,
    posId,
    divId,
    attendance,
    attType,
    location,
    latitude,
    longitude,
    remarks,
    activity,
  } = req.body;

  if (!useId || !empId || !posId || !divId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (useId, empId, posId, divId)",
    });
  }

  try {
    const today = moment();
    const dayOfWeek = today.day(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Load reference: ATTENDANCETIME
    const clockInKey = isWeekend ? "CLOCKINWEEKENDMAX" : "CLOCKINWEEKDAYMAX";
    const clockInMaxValue = await getConfigValue("ATTENDANCETIME", clockInKey);

    if (!clockInMaxValue) {
      return res.status(500).json({
        success: false,
        message: `Reference key ${clockInKey} not found`,
      });
    }

    const maxTime = moment(
      `${today.format("YYYY-MM-DD")} ${clockInMaxValue}`,
      "YYYY-MM-DD HH:mm"
    );

    if (today.isAfter(maxTime)) {
      return res.status(400).json({
        success: false,
        message: `Clock In maksimal jam ${clockInMaxValue}`,
      });
    }

    const todayAttendance = await checkTodayAttendance(empId);
    if (todayAttendance) {
      if (todayAttendance.end_date) {
        return res
          .status(400)
          .json({ success: false, message: "Sudah clock out hari ini" });
      }
      return res
        .status(400)
        .json({ success: false, message: "Sudah clock in hari ini" });
    }

    const createdBy = req.user?.username || "SYSTEM";
    const createdDate = new Date();

    const sql = `
      INSERT INTO attendance
      (use_id, emp_id, pos_id, div_id, start_date, attendance, att_type, location, latitude, longitude, remarks, activity, created_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      useId,
      empId,
      posId,
      divId,
      createdDate,
      attendance || "Hadir",
      attType || "WFO",
      location,
      latitude,
      longitude,
      remarks,
      activity,
      createdDate,
      createdBy,
    ]);

    return res.status(201).json({
      success: true,
      message: "Clock In success",
      attId: result.insertId,
    });
  } catch (err) {
    console.error("Error clockIn:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to clock in" });
  }
};

// Clock Out
exports.clockOut = async (req, res) => {
  const { attId } = req.params;
  const { location, latitude, longitude, remarks, activity, att_type } =
    req.body;

  try {
    const today = moment();
    const dayOfWeek = today.day(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Load reference ATTENDANCETIME
    const clockOutKey = isWeekend ? "CLOCKOUTWEEKENDMAX" : "CLOCKOUTWEEKDAYMAX";
    const clockOutMaxValue = await getConfigValue(
      "ATTENDANCETIME",
      clockOutKey
    );

    if (!clockOutMaxValue) {
      return res.status(500).json({
        success: false,
        message: `Reference key ${clockOutKey} not found`,
      });
    }

    const maxTime = moment(
      `${today.format("YYYY-MM-DD")} ${clockOutMaxValue}`,
      "YYYY-MM-DD HH:mm"
    );
    if (today.isAfter(maxTime)) {
      return res.status(400).json({
        success: false,
        message: `Clock Out maksimal jam ${clockOutMaxValue}`,
      });
    }

    const [rows] = await db.query("SELECT * FROM attendance WHERE att_id = ?", [
      attId,
    ]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    const attendance = rows[0];

    const todayAttendance = await checkTodayAttendance(attendance.emp_id);
    if (todayAttendance?.end_date) {
      return res
        .status(400)
        .json({ success: false, message: "Sudah clock out hari ini" });
    }

    const startDate = moment(attendance.start_date);
    const endDate = moment();

    if (endDate.isBefore(startDate)) {
      return res
        .status(400)
        .json({ success: false, message: "Clock out sebelum clock in" });
    }

    let hoursDiff = endDate.diff(startDate, "hours", true);
    let hours = hoursDiff < 1 ? 1 : Math.ceil(hoursDiff);

    const updateSql = `
      UPDATE attendance
      SET end_date = ?, qty = ?, location = COALESCE(?, location),
          latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude),
          remarks = COALESCE(?, remarks), activity = COALESCE(?, activity),
          att_type = COALESCE(?, att_type)
      WHERE att_id = ?
    `;

    await db.query(updateSql, [
      endDate.toDate(),
      hours,
      location,
      latitude,
      longitude,
      remarks,
      activity,
      att_type,
      attId,
    ]);

    return res.json({ success: true, message: "Clock Out success", hours });
  } catch (err) {
    console.error("Error clockOut:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to clock out" });
  }
};

// Correction
exports.correction = async (req, res) => {
  const { attId } = req.params;
  const { startDate, endDate, remarks, activity } = req.body;

  try {
    const sql = `
      UPDATE attendance
      SET start_date = ?, end_date = ?, remarks = ?, activity = ?, qty = TIMESTAMPDIFF(HOUR, ?, ?)
      WHERE att_id = ?
    `;
    const [result] = await db.query(sql, [
      startDate,
      endDate,
      remarks,
      activity,
      startDate,
      endDate,
      attId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    return res.json({ success: true, message: "Correction success" });
  } catch (err) {
    console.error("Error correction:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to correct attendance" });
  }
};

// Approval
exports.approval = async (req, res) => {
  const { attId } = req.params;
  const { approvalStatus } = req.body;
  const approvedBy = req.user?.username || "SYSTEM";

  try {
    const sql = `
      UPDATE attendance
      SET attendance = ?, remarks = CONCAT(IFNULL(remarks,''), ' | Approved by ', ?)
      WHERE att_id = ?
    `;
    const [result] = await db.query(sql, [approvalStatus, approvedBy, attId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    return res.json({ success: true, message: "Approval success" });
  } catch (err) {
    console.error("Error approval:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to approve" });
  }
};

// Search
exports.search = async (req, res) => {
  const { page = 1, limit = 10, keyword = "", attendanceType = "" } = req.query;
  const currentPage = parseInt(page);
  const limitValue = parseInt(limit);

  let whereClause = "WHERE 1=1";
  const values = [];

  if (keyword) {
    whereClause +=
      " AND (remarks LIKE ? OR activity LIKE ? OR location LIKE ?)";
    values.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (attendanceType) {
    whereClause += " AND attendance = ?";
    values.push(attendanceType);
  }

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS totalItems FROM attendance ${whereClause}`,
      values
    );
    const totalData = countRows[0].totalItems;
    const totalPages = Math.ceil(totalData / limitValue);

    const sql = `SELECT * FROM attendance ${whereClause} ORDER BY start_date DESC LIMIT ? OFFSET ?`;
    const [rows] = await db.query(sql, [
      ...values,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    return res.json({
      success: true,
      message: "Search success",
      data: rows.map(formatAttendanceData),
      totalData,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error search:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to search" });
  }
};

// History
exports.history = async (req, res) => {
  const {
    empId,
    divId,
    posId,
    page = 1,
    limit = 10,
    startDate,
    endDate,
  } = req.body;
  const currentUser = req.user;
  const currentPage = parseInt(page);
  const limitValue = parseInt(limit);

  let whereClause = "WHERE 1=1";
  const values = [];

  const finalEmpId = empId || currentUser?.empId;
  if (finalEmpId) {
    whereClause += " AND a.emp_id = ?";
    values.push(finalEmpId);
  }
  if (divId) {
    whereClause += " AND a.div_id = ?";
    values.push(divId);
  }
  if (posId) {
    whereClause += " AND a.pos_id = ?";
    values.push(posId);
  }
  if (startDate) {
    whereClause += " AND DATE(a.start_date) >= ?";
    values.push(startDate);
  }
  if (endDate) {
    whereClause += " AND DATE(a.start_date) <= ?";
    values.push(endDate);
  }

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS totalItems FROM attendance a ${whereClause}`,
      values
    );
    const totalData = countRows[0].totalItems;
    const totalPages = Math.ceil(totalData / limitValue);

    const sql = `
      SELECT a.*, e.fullname, d.division_name, p.position_name
      FROM attendance a
      LEFT JOIN employee e ON a.emp_id = e.emp_id
      LEFT JOIN division d ON a.div_id = d.div_id
      LEFT JOIN position p ON a.pos_id = p.pos_id
      ${whereClause}
      ORDER BY a.start_date DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [
      ...values,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    return res.json({
      success: true,
      message: "History success",
      data: rows.map(formatAttendanceForFrontend),
      totalData,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error history:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get history" });
  }
};
