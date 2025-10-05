// controllers/employeeController.js
const db = require("../configuration/connection");
const moment = require("moment");

// Helper employee data formatter
const formatEmployeeData = (data) => ({
  empId: data.emp_id,
  fullName: data.fullname,
  gender: data.gender,
  birthday: data.birthday ? moment(data.birthday).format("YYYY-MM-DD") : null,
  family: data.family,
  divId: data.div_id,
  divisionCode: data.division_code,
  divisionName: data.division_name,
  posId: data.pos_id,
  positionCode: data.position_code,
  positionName: data.position_name,
  phone: data.phone,
  email: data.email,
  address: data.address,
  status: data.status,
  createdDate: moment(data.created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.created_by,
});

// Get all employees
exports.getAllEmployees = async (req, res) => {
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
    ? `WHERE e.fullname LIKE ? OR e.email LIKE ? OR d.division_name LIKE ? OR p.position_name LIKE ?`
    : "";
  const searchValues = search
    ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
    : [];

  const countSql = `
    SELECT COUNT(*) AS totalItems 
    FROM employee e 
    LEFT JOIN division d ON e.div_id = d.div_id 
    LEFT JOIN position p ON e.pos_id = p.pos_id 
    ${searchQuery}
  `;

  try {
    const [countRows] = await db.query(countSql, searchValues);
    const totalData = countRows[0].totalItems;
    const totalPages = Math.ceil(totalData / limitValue);

    const sql = `
      SELECT e.emp_id, e.fullname, e.gender, e.birthday, e.family, e.div_id, 
             d.division_code, d.division_name, e.pos_id, p.position_code, p.position_name,
             e.phone, e.email, e.address, e.status, e.created_date, e.created_by
      FROM employee e
      LEFT JOIN division d ON e.div_id = d.div_id
      LEFT JOIN position p ON e.pos_id = p.pos_id
      ${searchQuery}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, [
      ...searchValues,
      limitValue,
      (currentPage - 1) * limitValue,
    ]);

    return res.status(200).json({
      success: true,
      message: "Success get employees",
      data: rows.map(formatEmployeeData),
      totalData,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error getAllEmployees:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get employees" });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  const { empId } = req.params;

  if (!empId || isNaN(empId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Employee ID" });
  }

  const sql = `
    SELECT e.emp_id, e.fullname, e.gender, e.birthday, e.family, e.div_id, 
           d.division_code, d.division_name, p.pos_id, p.position_code, p.position_name, 
           e.phone, e.email, e.address, e.status, e.created_date, e.created_by 
    FROM employee e 
    LEFT JOIN division d ON e.div_id = d.div_id 
    LEFT JOIN position p ON e.pos_id = p.pos_id 
    WHERE e.emp_id = ?
  `;

  try {
    const [rows] = await db.query(sql, [empId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Success get employee",
      data: formatEmployeeData(rows[0]),
    });
  } catch (err) {
    console.error("Error getEmployeeById:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get employee" });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  const {
    fullName,
    gender,
    birthday,
    family,
    posId,
    divId,
    email,
    phone,
    address,
    status,
    createdBy,
  } = req.body;

  if (!fullName || !email || !phone || !gender || !status) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const createdDate = new Date();

  const sql = `
    INSERT INTO employee 
      (fullname, gender, birthday, family, pos_id, div_id, email, phone, address, status, created_date, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(sql, [
      fullName,
      gender,
      birthday,
      family,
      posId,
      divId,
      email,
      phone,
      address,
      status,
      createdDate,
      createdBy,
    ]);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      empId: result.insertId,
    });
  } catch (err) {
    console.error("Error createEmployee:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create employee" });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  const { empId } = req.params;
  const {
    fullName,
    gender,
    birthday,
    family,
    posId,
    divId,
    email,
    phone,
    address,
    status,
  } = req.body;

  if (!empId || isNaN(empId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Employee ID" });
  }

  if (!fullName || !email || !phone || !gender || !status) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const sql = `
    UPDATE employee 
    SET fullname = ?, gender = ?, birthday = ?, family = ?, pos_id = ?, div_id = ?, 
        email = ?, phone = ?, address = ?, status = ? 
    WHERE emp_id = ?
  `;

  try {
    const [result] = await db.query(sql, [
      fullName,
      gender,
      birthday,
      family,
      posId,
      divId,
      email,
      phone,
      address,
      status,
      empId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Employee updated successfully" });
  } catch (err) {
    console.error("Error updateEmployee:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update employee" });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  const { empId } = req.params;

  if (!empId || isNaN(empId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Employee ID" });
  }

  const sql = `DELETE FROM employee WHERE emp_id = ?`;

  try {
    const [result] = await db.query(sql, [empId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleteEmployee:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete employee" });
  }
};

// Search employee
exports.searchEmployee = async (req, res) => {
  const keyword = req.query.keyword || "";

  if (typeof keyword !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid keyword format" });
  }

  const likeKeyword = `%${keyword}%`;

  const sql = `
    SELECT e.emp_id, e.fullname, e.gender, e.birthday, e.family, e.div_id, 
           d.division_code, d.division_name, e.pos_id, p.position_code, p.position_name, 
           e.phone, e.email, e.address, e.status, e.created_date, e.created_by
    FROM employee e
    LEFT JOIN division d ON e.div_id = d.div_id
    LEFT JOIN position p ON e.pos_id = p.pos_id
    WHERE e.fullname LIKE ? OR e.email LIKE ? OR d.division_name LIKE ? OR p.position_name LIKE ?
  `;

  try {
    const [rows] = await db.query(sql, [
      likeKeyword,
      likeKeyword,
      likeKeyword,
      likeKeyword,
    ]);

    return res.status(200).json({
      success: true,
      message: "Success search employees",
      data: rows.map(formatEmployeeData),
    });
  } catch (err) {
    console.error("Error searchEmployee:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to search employees" });
  }
};
