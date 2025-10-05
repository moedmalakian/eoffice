// controllers/referenceController.js
const db = require("../configuration/connection");
const moment = require("moment");

// Helper reference data formatter
const formatHeader = (data) => ({
  rfhId: data.rfh_id,
  referenceCode: data.reference_code,
  referenceName: data.reference_name,
  description: data.header_desc,
  createdDate: moment(data.header_created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.header_created_by,
});

const formatDetail = (data) => ({
  rfdId: data.rfd_id,
  rfhId: data.rfh_id,
  referenceKey: data.reference_key,
  referenceValue: data.reference_value,
  referenceType: data.reference_type,
  description: data.detail_desc,
  createdDate: moment(data.detail_created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.detail_created_by,
});

// Get all references
exports.getAllReference = async (req, res) => {
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
    ? `WHERE reference_code LIKE ? OR reference_name LIKE ?`
    : "";
  const searchValues = search ? [`%${search}%`, `%${search}%`] : [];

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS totalItems FROM reference_header ${searchQuery}`,
      searchValues
    );
    const totalData = countRows[0].totalItems;
    const totalPages = Math.ceil(totalData / limitValue);

    const [headers] = await db.query(
      `
      SELECT rfh_id, reference_code, reference_name, description, 
             created_date, created_by
      FROM reference_header
      ${searchQuery}
      ORDER BY rfh_id DESC
      LIMIT ? OFFSET ?
      `,
      [...searchValues, limitValue, (currentPage - 1) * limitValue]
    );

    const headerIds = headers.map((h) => h.rfh_id);
    let details = [];
    if (headerIds.length > 0) {
      const [detailRows] = await db.query(
        `
        SELECT rfd_id, rfh_id, reference_key, reference_value, reference_type, 
               description, created_date, created_by
        FROM reference_detail
        WHERE rfh_id IN (?)
        ORDER BY rfd_id ASC
        `,
        [headerIds]
      );
      details = detailRows;
    }

    const data = headers.map((h) => ({
      rfhId: h.rfh_id,
      referenceCode: h.reference_code,
      referenceName: h.reference_name,
      description: h.description,
      createdDate: h.created_date,
      createdBy: h.created_by,
      details: details
        .filter((d) => d.rfh_id === h.rfh_id)
        .map((d) => ({
          rfdId: d.rfd_id,
          rfhId: d.rfh_id,
          referenceKey: d.reference_key,
          referenceValue: d.reference_value,
          referenceType: d.reference_type,
          description: d.description,
          createdDate: d.created_date,
          createdBy: d.created_by,
        })),
    }));

    return res.status(200).json({
      success: true,
      message: "Success fetching references",
      data,
      totalData,
      currentPage,
      totalPages,
      limit: limitValue,
    });
  } catch (err) {
    console.error("Error getAllReference:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch references" });
  }
};

// Get reference by ID
exports.getReferenceById = async (req, res) => {
  const { rfhId } = req.params;
  if (!rfhId || isNaN(rfhId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Header ID" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT h.rfh_id, h.reference_code, h.reference_name, h.description as header_desc, 
             h.created_date as header_created_date, h.created_by as header_created_by,
             d.rfd_id, d.reference_key, d.reference_value, d.reference_type, d.description as detail_desc,
             d.created_date as detail_created_date, d.created_by as detail_created_by
      FROM reference_header h
      LEFT JOIN reference_detail d ON h.rfh_id = d.rfh_id
      WHERE h.rfh_id = ?
      ORDER BY d.rfd_id ASC
    `,
      [rfhId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reference not found" });
    }

    const header = formatHeader(rows[0]);
    const details = rows.filter((r) => r.rfd_id).map(formatDetail);

    return res.status(200).json({
      success: true,
      message: "Success fetching reference",
      data: { header, details },
    });
  } catch (err) {
    console.error("Error getReferenceById:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch reference" });
  }
};

// Get reference by code
exports.getReferenceByCode = async (req, res) => {
  const { referenceCode } = req.params;

  if (!referenceCode || typeof referenceCode !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Reference Code" });
  }

  try {
    const [results] = await db.query(
      `
      SELECT h.rfh_id, h.reference_code, h.reference_name, h.description as header_desc, 
             h.created_date as header_created_date, h.created_by as header_created_by,
             d.rfd_id, d.reference_key, d.reference_value, d.reference_type, d.description as detail_desc,
             d.created_date as detail_created_date, d.created_by as detail_created_by
      FROM reference_header h
      LEFT JOIN reference_detail d ON h.rfh_id = d.rfh_id
      WHERE h.reference_code = ?
      ORDER BY d.rfd_id ASC
    `,
      [referenceCode]
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reference not found" });
    }

    const header = formatHeader(results[0]);
    const details = results.filter((r) => r.rfd_id).map(formatDetail);

    return res.status(200).json({
      success: true,
      message: "Success fetching reference by code",
      data: { header, details },
    });
  } catch (err) {
    console.error("Error getReferenceByCode:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get reference by code" });
  }
};

// Get reference list
exports.getReferenceList = async (req, res) => {
  try {
    const codes = req.body.referenceCode;

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "referenceCode must be an array with at least 1 element",
      });
    }

    const result = {};

    for (const code of codes) {
      const [rows] = await db.query(
        `
        SELECT h.rfh_id, h.reference_code, h.reference_name, h.description as header_desc, 
               h.created_date as header_created_date, h.created_by as header_created_by,
               d.rfd_id, d.reference_key, d.reference_value, d.reference_type, d.description as detail_desc,
               d.created_date as detail_created_date, d.created_by as detail_created_by
        FROM reference_header h
        LEFT JOIN reference_detail d ON h.rfh_id = d.rfh_id
        WHERE h.reference_code = ?
        ORDER BY d.rfd_id ASC
        `,
        [code]
      );

      if (rows.length > 0) {
        const header = {
          rfhId: rows[0].rfh_id,
          referenceCode: rows[0].reference_code,
          referenceName: rows[0].reference_name,
          description: rows[0].header_desc,
          createdDate: rows[0].header_created_date,
          createdBy: rows[0].header_created_by,
        };

        const details = rows
          .filter((r) => r.rfd_id)
          .map((r) => ({
            rfdId: r.rfd_id,
            rfhId: r.rfh_id,
            referenceKey: r.reference_key,
            referenceValue: r.reference_value,
            referenceType: r.reference_type,
            description: r.detail_desc,
            createdDate: r.detail_created_date,
            createdBy: r.detail_created_by,
          }));

        result[code] = { header, details };
      } else {
        result[code] = null;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Success fetching reference list",
      data: result,
    });
  } catch (err) {
    console.error("Error getReferenceList:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reference list",
    });
  }
};

// Create reference
exports.createReference = async (req, res) => {
  const { header, details } = req.body;
  const createdBy = req.user?.username || "UNKNOWN";
  const createdDate = new Date();

  if (!header.referenceCode || !header.referenceName) {
    return res.status(400).json({
      success: false,
      message: "referenceCode and referenceName are required",
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [headerResult] = await conn.query(
      `INSERT INTO reference_header (reference_code, reference_name, description, created_date, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        header.referenceCode,
        header.referenceName,
        header.description || null,
        createdDate,
        createdBy,
      ]
    );

    const rfhId = headerResult.insertId;

    if (Array.isArray(details) && details.length > 0) {
      const values = details.map((detail) => [
        rfhId,
        detail.referenceKey || null,
        detail.referenceValue || null,
        detail.referenceType || null,
        detail.description || null,
        createdDate,
        createdBy,
      ]);

      await conn.query(
        `INSERT INTO reference_detail 
         (rfh_id, reference_key, reference_value, reference_type, description, created_date, created_by)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return res.status(201).json({
      success: true,
      message: "Reference created successfully",
      data: { rfhId },
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error createReference:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create reference" });
  } finally {
    conn.release();
  }
};

// Update reference
exports.updateReference = async (req, res) => {
  const { rfhId } = req.params;
  const { header, details } = req.body;
  const updatedBy = req.user?.username || "UNKNOWN";
  const updatedDate = new Date();

  if (!rfhId || isNaN(rfhId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Header ID" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE reference_header
       SET reference_code=?, reference_name=?, description=?, updated_date=?, updated_by=?
       WHERE rfh_id=?`,
      [
        header.referenceCode,
        header.referenceName,
        header.description || null,
        updatedDate,
        updatedBy,
        rfhId,
      ]
    );

    await conn.query(`DELETE FROM reference_detail WHERE rfh_id=?`, [rfhId]);

    if (Array.isArray(details) && details.length > 0) {
      const values = details.map((detail) => [
        rfhId,
        detail.referenceKey || null,
        detail.referenceValue || null,
        detail.referenceType || null,
        detail.description || null,
        updatedDate,
        updatedBy,
      ]);

      await conn.query(
        `INSERT INTO reference_detail 
         (rfh_id, reference_key, reference_value, reference_type, description, updated_date, updated_by)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return res
      .status(200)
      .json({ success: true, message: "Reference updated" });
  } catch (err) {
    await conn.rollback();
    console.error("Error updateReference:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update reference" });
  } finally {
    conn.release();
  }
};

// Delete reference
exports.deleteReference = async (req, res) => {
  const { rfhId } = req.params;
  if (!rfhId || isNaN(rfhId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Header ID" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`DELETE FROM reference_detail WHERE rfh_id=?`, [rfhId]);
    const [result] = await conn.query(
      `DELETE FROM reference_header WHERE rfh_id=?`,
      [rfhId]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Reference not found" });
    }

    await conn.commit();
    return res
      .status(200)
      .json({ success: true, message: "Reference deleted" });
  } catch (err) {
    await conn.rollback();
    console.error("Error deleteReference:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete reference" });
  } finally {
    conn.release();
  }
};
