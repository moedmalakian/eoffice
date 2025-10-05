// controllers/objectController.js
const moment = require("moment");
const db = require("../configuration/connection");

// Helper data formatter
const formatObjectData = (data) => ({
  objId: data.obj_id,
  objectName: data.object_name,
  accessName: data.access_name,
  linkUrl: data.link_url,
  folderPath: data.folder_path,
  slug: data.slug,
  componentName: data.component_name,
  isMenu: data.is_menu,
  icon: data.icon,
  parentObjId: data.parent_obj_id,
  order: data.order,
  status: data.status,
  createdDate: moment(data.created_date).format("YYYY-MM-DD HH:mm:ss"),
  createdBy: data.created_by,
});

// Get menu objects
exports.getMenuObjects = async (req, res) => {
  const sql = `
    SELECT obj_id, object_name, access_name, link_url, folder_path, slug,
           component_name, is_menu, icon, parent_obj_id, \`order\`, status,
           created_date, created_by
    FROM object 
    WHERE status = 'Y' AND is_menu = 'Y'
    ORDER BY COALESCE(parent_obj_id, 0), \`order\` ASC
  `;
  try {
    const [results] = await db.query(sql);
    const data = results.map(formatObjectData);
    return res.status(200).json({
      success: true,
      message: "Menu objects retrieved successfully",
      data,
      total: data.length,
    });
  } catch (err) {
    console.error("Error fetching menu objects:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu objects",
      error: err.message,
    });
  }
};

// Get all objects
exports.getAllObjects = async (req, res) => {
  const { search = "" } = req.query;
  let whereClause = "WHERE status = 'Y'";
  let queryParams = [];

  if (search) {
    whereClause += ` AND (
      object_name LIKE ? OR access_name LIKE ? OR link_url LIKE ? OR 
      folder_path LIKE ? OR slug LIKE ? OR component_name LIKE ? OR 
      is_menu LIKE ? OR icon LIKE ?
    )`;
    const searchParam = `%${search}%`;
    queryParams = Array(8).fill(searchParam);
  }

  const sql = `
    SELECT obj_id, object_name, access_name, link_url, folder_path, slug,
           component_name, is_menu, icon, parent_obj_id, \`order\`, status,
           created_date, created_by
    FROM object 
    ${whereClause}
    ORDER BY COALESCE(parent_obj_id, 0), \`order\` ASC
  `;
  try {
    const [results] = await db.query(sql, queryParams);
    const data = results.map(formatObjectData);
    return res.status(200).json({
      success: true,
      message: "Objects retrieved successfully",
      data,
      totalData: data.length,
    });
  } catch (err) {
    console.error("Error fetching objects:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch objects",
      error: err.message,
    });
  }
};

// Get parent object
exports.getParentObject = async (req, res) => {
  const { search = "", exclude = "" } = req.query;
  let baseQuery = "WHERE is_menu = 'Y' AND status = 'Y'";
  const searchValues = [];

  if (exclude && !isNaN(exclude)) {
    baseQuery += " AND obj_id != ?";
    searchValues.push(parseInt(exclude, 10));
  }
  if (search) {
    baseQuery += ` AND (
      object_name LIKE ? OR access_name LIKE ? OR link_url LIKE ? OR 
      folder_path LIKE ? OR slug LIKE ? OR component_name LIKE ? OR icon LIKE ?
    )`;
    searchValues.push(...Array(7).fill(`%${search}%`));
  }

  const sql = `
    SELECT obj_id, object_name, access_name, link_url, folder_path, slug,
           component_name, is_menu, icon, parent_obj_id, \`order\`, status,
           created_date, created_by
    FROM object 
    ${baseQuery}
    ORDER BY \`order\` ASC, object_name ASC
  `;
  try {
    const [results] = await db.query(sql, searchValues);
    const data = results.map(formatObjectData);
    return res.status(200).json({
      success: true,
      message: "Parent objects retrieved successfully",
      data,
      total: data.length,
    });
  } catch (err) {
    console.error("Error fetching parent objects:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch parent objects",
      error: err.message,
    });
  }
};

// Helpers
const getNextOrder = async (parentObjId) => {
  const sql = `SELECT MAX(\`order\`) as maxOrder FROM object WHERE parent_obj_id ${
    parentObjId ? "= ?" : "IS NULL"
  }`;
  const [results] = await db.query(sql, parentObjId ? [parentObjId] : []);
  return (results[0]?.maxOrder || 0) + 1;
};
const reorderSiblings = async (parentObjId, excludeObjId = null) => {
  const sql = `
    SELECT obj_id, \`order\` 
    FROM object 
    WHERE parent_obj_id ${parentObjId ? "= ?" : "IS NULL"}
    ${excludeObjId ? "AND obj_id != ?" : ""}
    ORDER BY \`order\` ASC
  `;
  const params = [];
  if (parentObjId) params.push(parentObjId);
  if (excludeObjId) params.push(excludeObjId);
  const [siblings] = await db.query(sql, params);
  for (let i = 0; i < siblings.length; i++) {
    if (siblings[i].order !== i + 1) {
      await db.query("UPDATE object SET `order` = ? WHERE obj_id = ?", [
        i + 1,
        siblings[i].obj_id,
      ]);
    }
  }
};

// Get object by ID
exports.getObjectById = async (req, res) => {
  const { objId } = req.params;
  if (!objId || isNaN(objId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Object ID" });
  }
  try {
    const [results] = await db.query("SELECT * FROM object WHERE obj_id = ?", [
      objId,
    ]);
    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Object not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Object retrieved successfully",
      data: formatObjectData(results[0]),
    });
  } catch (err) {
    console.error("Error fetching object by ID:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch object" });
  }
};

// Create object
exports.createObject = async (req, res) => {
  try {
    const {
      objectName,
      accessName,
      linkUrl,
      folderPath,
      slug,
      componentName,
      isMenu,
      icon,
      parentObjId,
      status,
    } = req.body;
    if (!objectName || !accessName) {
      return res.status(400).json({
        success: false,
        message: "Object name and access name are required",
      });
    }
    if (isMenu === "N" && parentObjId) {
      const [parent] = await db.query(
        "SELECT 1 FROM object WHERE obj_id = ? AND is_menu = 'Y' AND status = 'Y'",
        [parentObjId]
      );
      if (parent.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Parent object must be an active menu item",
        });
      }
    }
    const createdBy = req.user?.username || "UNKNOWN";
    const createdDate = new Date();
    const nextOrder = await getNextOrder(parentObjId || null);
    const insertSql = `
      INSERT INTO object (
        object_name, access_name, link_url, folder_path, slug,
        component_name, is_menu, icon, parent_obj_id,
        \`order\`, status, created_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(insertSql, [
      objectName,
      accessName,
      linkUrl,
      folderPath,
      slug,
      componentName,
      isMenu || "N",
      icon || null,
      parentObjId || null,
      nextOrder,
      status || "Y",
      createdDate,
      createdBy,
    ]);
    await reorderSiblings(parentObjId || null);
    const [createdObject] = await db.query(
      "SELECT * FROM object WHERE obj_id = ?",
      [result.insertId]
    );
    return res.status(201).json({
      success: true,
      message: "Object created successfully",
      data: formatObjectData(createdObject[0]),
    });
  } catch (err) {
    console.error("Error in createObject:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Update object
exports.updateObject = async (req, res) => {
  try {
    const { objId } = req.params;
    const {
      objectName,
      accessName,
      linkUrl,
      folderPath,
      slug,
      componentName,
      isMenu,
      icon,
      parentObjId,
      status,
    } = req.body;
    if (!objId || isNaN(objId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Object ID" });
    }
    if (!objectName || !accessName) {
      return res.status(400).json({
        success: false,
        message: "Object name and access name are required",
      });
    }
    const [currentDataRows] = await db.query(
      "SELECT parent_obj_id, `order`, is_menu FROM object WHERE obj_id = ?",
      [objId]
    );
    const currentData = currentDataRows[0];
    if (!currentData)
      return res
        .status(404)
        .json({ success: false, message: "Object not found" });

    if (isMenu === "N" && parentObjId) {
      const [parent] = await db.query(
        "SELECT 1 FROM object WHERE obj_id = ? AND is_menu = 'Y' AND status = 'Y'",
        [parentObjId]
      );
      if (parent.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Parent object must be an active menu item",
        });
      }
    }
    if (parentObjId) {
      let currentParent = parentObjId;
      while (currentParent) {
        if (currentParent == objId) {
          return res
            .status(400)
            .json({ success: false, message: "Circular reference detected" });
        }
        const [parentDataRows] = await db.query(
          "SELECT parent_obj_id FROM object WHERE obj_id = ?",
          [currentParent]
        );
        currentParent = parentDataRows[0]?.parent_obj_id;
      }
    }

    const parentObjIdValue = parentObjId === "" ? null : parentObjId;
    let newOrder = await getNextOrder(parentObjIdValue);
    if (currentData.parent_obj_id == parentObjIdValue)
      newOrder = currentData.order;

    const updatedBy = req.user?.username || "UNKNOWN";
    const updatedDate = new Date();
    const sql = `
      UPDATE object SET 
        object_name=?, access_name=?, link_url=?, folder_path=?, slug=?, 
        component_name=?, is_menu=?, icon=?, parent_obj_id=?, 
        \`order\`=?, status=?, created_date=?, created_by=? 
      WHERE obj_id=?
    `;
    const [result] = await db.query(sql, [
      objectName,
      accessName,
      linkUrl,
      folderPath,
      slug,
      componentName,
      isMenu,
      icon,
      parentObjIdValue,
      newOrder,
      status,
      updatedDate,
      updatedBy,
      objId,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Object not found" });

    await reorderSiblings(currentData.parent_obj_id || null, objId);
    if (currentData.parent_obj_id !== parentObjIdValue) {
      await reorderSiblings(parentObjIdValue || null);
    }
    const [updatedObject] = await db.query(
      "SELECT * FROM object WHERE obj_id = ?",
      [objId]
    );
    return res.status(200).json({
      success: true,
      message: "Object updated successfully",
      data: formatObjectData(updatedObject[0]),
    });
  } catch (err) {
    console.error("Error in updateObject:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Delete object
exports.deleteObject = async (req, res) => {
  const { objId } = req.params;
  if (!objId || isNaN(objId))
    return res
      .status(400)
      .json({ success: false, message: "Invalid Object ID" });

  try {
    const [objectDataRows] = await db.query(
      "SELECT parent_obj_id FROM object WHERE obj_id = ?",
      [objId]
    );
    const objectData = objectDataRows[0];
    if (!objectData)
      return res
        .status(404)
        .json({ success: false, message: "Object not found" });

    const [childrenRows] = await db.query(
      "SELECT COUNT(*) as childCount FROM object WHERE parent_obj_id = ? AND status = 'Y'",
      [objId]
    );
    if (childrenRows[0].childCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete object that has child items",
      });
    }

    const [result] = await db.query(
      "UPDATE object SET status = 'N' WHERE obj_id = ?",
      [objId]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Object not found" });

    await reorderSiblings(objectData.parent_obj_id || null);
    return res
      .status(200)
      .json({ success: true, message: "Object deleted successfully" });
  } catch (err) {
    console.error("Error deleting object:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete object",
      error: err.message,
    });
  }
};

// Reorder objects
exports.reorderObject = async (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payload. Expected array of orders.",
    });
  }
  try {
    const objIds = orders.map((i) => i.objId);
    if (objIds.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No objects to reorder" });

    const [existingRows] = await db.query(
      "SELECT obj_id FROM object WHERE obj_id IN (?) AND status='Y'",
      [objIds]
    );
    const existingObjects = existingRows.map((i) => i.obj_id);
    if (existingObjects.length !== orders.length) {
      return res.status(400).json({
        success: false,
        message: "Some objects not found or inactive",
      });
    }

    const parentMap = {};
    orders.forEach((i) => {
      parentMap[i.objId] = i.parentObjId;
    });
    const hasCircular = orders.some((i) => {
      let current = i.parentObjId;
      while (current) {
        if (current === i.objId) return true;
        current = parentMap[current];
      }
      return false;
    });
    if (hasCircular)
      return res.status(400).json({
        success: false,
        message: "Circular reference detected in hierarchy",
      });

    const parentGroups = {};
    orders.forEach((i) => {
      const parentKey = i.parentObjId || "null";
      if (!parentGroups[parentKey]) parentGroups[parentKey] = [];
      parentGroups[parentKey].push(i);
    });

    for (const items of Object.values(parentGroups)) {
      items.sort((a, b) => a.order - b.order);
      for (let i = 0; i < items.length; i++) {
        await db.query(
          "UPDATE object SET `order`=?, parent_obj_id=? WHERE obj_id=?",
          [i + 1, items[i].parentObjId || null, items[i].objId]
        );
      }
    }
    return res.status(200).json({
      success: true,
      message: "Objects reordered successfully",
      data: { reorderedCount: orders.length },
    });
  } catch (err) {
    console.error("Error reordering objects:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder objects",
      error: err.message,
    });
  }
};

// Copy object
exports.copyObject = async (req, res) => {
  const { objId } = req.params;
  if (!objId || isNaN(objId))
    return res
      .status(400)
      .json({ success: false, message: "Invalid Object ID" });
  try {
    const [originalRows] = await db.query(
      "SELECT * FROM object WHERE obj_id = ? AND status='Y'",
      [objId]
    );
    const originalObject = originalRows[0];
    if (!originalObject)
      return res
        .status(404)
        .json({ success: false, message: "Object not found" });

    const createdBy = req.user?.username || "UNKNOWN";
    const createdDate = new Date();
    const nextOrder = await getNextOrder(originalObject.parent_obj_id || null);
    const copyName = `${originalObject.object_name} (Copy)`;

    const insertSql = `
      INSERT INTO object (
        object_name, access_name, link_url, folder_path, slug,
        component_name, is_menu, icon, parent_obj_id,
        \`order\`, status, created_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(insertSql, [
      copyName,
      originalObject.access_name,
      originalObject.link_url,
      originalObject.folder_path,
      originalObject.slug,
      originalObject.component_name,
      originalObject.is_menu,
      originalObject.icon,
      originalObject.parent_obj_id,
      nextOrder,
      originalObject.status,
      createdDate,
      createdBy,
    ]);
    await reorderSiblings(originalObject.parent_obj_id || null);

    const [copiedObject] = await db.query(
      "SELECT * FROM object WHERE obj_id = ?",
      [result.insertId]
    );
    return res.status(201).json({
      success: true,
      message: "Object copied successfully",
      data: formatObjectData(copiedObject[0]),
    });
  } catch (err) {
    console.error("Error in copyObject:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
