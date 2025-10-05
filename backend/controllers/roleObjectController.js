const db = require("../configuration/connection");
const moment = require("moment");

// Get all objects
exports.getAllObjects = async (req, res) => {
  const sql = "SELECT * FROM object ORDER BY `order` ASC, obj_id ASC";

  try {
    const [rows] = await db.query(sql);
    const data = rows.map((row) => ({
      objId: row.obj_id,
      objectName: row.object_name,
      accessName: row.access_name,
      linkUrl: row.link_url,
      folderPath: row.folder_path,
      slug: row.slug,
      componentName: row.component_name,
      icon: row.icon,
      isMenu: row.is_menu,
      status: row.status,
      parentObjId: row.parent_obj_id,
    }));

    return res.status(200).json({
      success: true,
      message: "Success fetching all objects",
      data,
    });
  } catch (error) {
    console.error("Error fetching objects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch objects",
      error: error.message,
    });
  }
};

// Get role object by ID
exports.getRoleObject = async (req, res) => {
  const { rolId } = req.params;
  const sql = "SELECT obj_id FROM role_object WHERE rol_id = ?";

  try {
    const [results] = await db.query(sql, [rolId]);

    const selectedObjects = results.map((row) => row.obj_id);

    return res.status(200).json({
      success: true,
      message: "Success fetching role access",
      data: { selectedObjects },
    });
  } catch (error) {
    console.error("Error fetching role-object:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch role-object access",
      error: error.message,
    });
  }
};

// Create or update role object
exports.createRoleObject = async (req, res) => {
  const { rolId, selectedObjects } = req.body;

  if (!rolId || !Array.isArray(selectedObjects)) {
    return res.status(400).json({
      success: false,
      message: "Invalid data format. Expected rolId and selectedObjects[]",
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const deleteSql = "DELETE FROM role_object WHERE rol_id = ?";
    await conn.query(deleteSql, [rolId]);

    if (selectedObjects.length > 0) {
      const insertSql = `
        INSERT INTO role_object (rol_id, obj_id, created_date, created_by)
        VALUES ?
      `;
      const values = selectedObjects.map((objId) => [
        rolId,
        objId,
        moment().format("YYYY-MM-DD HH:mm:ss"),
        "SYSTEM",
      ]);

      await conn.query(insertSql, [values]);
    }

    await conn.commit();
    conn.release();

    return res.status(200).json({
      success: true,
      message: "Role access saved successfully",
    });
  } catch (error) {
    await conn.rollback();
    conn.release();

    console.error("Error saving role-object:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save role-object access",
      error: error.message,
    });
  }
};
