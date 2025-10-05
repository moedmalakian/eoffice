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
exports.getMenuObjects = (req, res) => {
  const sql = `
    SELECT 
      obj_id, 
      object_name, 
      access_name, 
      link_url, 
      folder_path, 
      slug, 
      component_name, 
      is_menu, 
      icon, 
      parent_obj_id, 
      \`order\`, 
      status,
      created_date,
      created_by
    FROM object 
    WHERE status = 'Y' AND is_menu = 'Y'
    ORDER BY COALESCE(parent_obj_id, 0), \`order\` ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching menu objects:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch menu objects",
        error: err.message,
      });
    }

    const data = results.map(formatObjectData);

    return res.status(200).json({
      success: true,
      message: "Menu objects retrieved successfully",
      data: data,
      total: data.length,
    });
  });
};

// Get all object
// Get all object
exports.getAllObjects = (req, res) => {
  const { search = "" } = req.query;

  let whereClause = "WHERE status = 'Y'";
  let queryParams = [];

  if (search) {
    whereClause += ` AND (
      object_name LIKE ? OR 
      access_name LIKE ? OR 
      link_url LIKE ? OR 
      folder_path LIKE ? OR 
      slug LIKE ? OR 
      component_name LIKE ? OR 
      is_menu LIKE ? OR 
      icon LIKE ?
    )`;
    const searchParam = `%${search}%`;
    queryParams = Array(8).fill(searchParam);
  }

  const dataSql = `
    SELECT 
      obj_id, 
      object_name, 
      access_name, 
      link_url, 
      folder_path, 
      slug, 
      component_name, 
      is_menu, 
      icon, 
      parent_obj_id, 
      \`order\`, 
      status, 
      created_date, 
      created_by 
    FROM object 
    ${whereClause}
    ORDER BY COALESCE(parent_obj_id, 0), \`order\` ASC
  `;

  db.query(dataSql, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching objects:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch objects",
      });
    }

    const data = results.map(formatObjectData);

    return res.status(200).json({
      success: true,
      message: "Objects retrieved successfully",
      data: data,
      totalData: data.length,
    });
  });
};

// Get parent object
exports.getParentObject = (req, res) => {
  const { search = "", exclude = "" } = req.query;

  let baseQuery = "WHERE is_menu = 'Y' AND status = 'Y'";
  let searchValues = [];

  if (exclude && !isNaN(exclude)) {
    baseQuery += " AND obj_id != ?";
    searchValues.push(parseInt(exclude));
  }

  if (search) {
    baseQuery += ` AND (
      object_name LIKE ? OR 
      access_name LIKE ? OR 
      link_url LIKE ? OR 
      folder_path LIKE ? OR 
      slug LIKE ? OR 
      component_name LIKE ? OR 
      icon LIKE ?
    )`;
    searchValues.push(...Array(7).fill(`%${search}%`));
  }

  const sql = `
    SELECT 
      obj_id, 
      object_name, 
      access_name, 
      link_url, 
      folder_path, 
      slug, 
      component_name, 
      is_menu, 
      icon, 
      parent_obj_id, 
      \`order\`, 
      status, 
      created_date, 
      created_by
    FROM object 
    ${baseQuery}
    ORDER BY \`order\` ASC, object_name ASC
  `;

  db.query(sql, searchValues, (err, results) => {
    if (err) {
      console.error("Error fetching parent objects:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch parent objects",
      });
    }

    const data = results.map(formatObjectData);

    return res.status(200).json({
      success: true,
      message: "Parent objects retrieved successfully",
      data: data,
      total: data.length,
    });
  });
};

// Get next order
const getNextOrder = async (parentObjId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT MAX(\`order\`) as maxOrder FROM object WHERE parent_obj_id ${
      parentObjId ? "= ?" : "IS NULL"
    }`;
    db.query(query, parentObjId ? [parentObjId] : [], (err, results) => {
      if (err) return reject(err);
      resolve((results[0]?.maxOrder || 0) + 1);
    });
  });
};

// Reorder siblings
const reorderSiblings = async (parentObjId, excludeObjId = null) => {
  try {
    const siblings = await new Promise((resolve, reject) => {
      const query = `
        SELECT obj_id, \`order\` 
        FROM object 
        WHERE parent_obj_id ${parentObjId ? "= ?" : "IS NULL"}
        ${excludeObjId ? "AND obj_id != ?" : ""}
        ORDER BY \`order\` ASC
      `;
      const params = [];
      if (parentObjId) params.push(parentObjId);
      if (excludeObjId) params.push(excludeObjId);

      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling.order !== i + 1) {
        await new Promise((resolve, reject) => {
          db.query(
            "UPDATE object SET `order` = ? WHERE obj_id = ?",
            [i + 1, sibling.obj_id],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error in reorderSiblings:", error);
    throw error;
  }
};

// Get object by ID
exports.getObjectById = (req, res) => {
  const { objId } = req.params;

  if (!objId || isNaN(objId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Object ID",
    });
  }

  const sql = `
    SELECT 
      obj_id, 
      object_name, 
      access_name, 
      link_url, 
      folder_path, 
      slug, 
      component_name, 
      is_menu, 
      icon, 
      parent_obj_id, 
      \`order\`, 
      status, 
      created_date, 
      created_by 
    FROM object 
    WHERE obj_id = ?
  `;

  db.query(sql, [objId], (err, results) => {
    if (err) {
      console.error("Error fetching object by ID:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch object",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Object not found",
      });
    }

    const data = formatObjectData(results[0]);

    return res.status(200).json({
      success: true,
      message: "Object retrieved successfully",
      data: data,
    });
  });
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
      const parentExists = await new Promise((resolve, reject) => {
        db.query(
          "SELECT 1 FROM object WHERE obj_id = ? AND is_menu = 'Y' AND status = 'Y'",
          [parentObjId],
          (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0);
          }
        );
      });

      if (!parentExists) {
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

    db.query(
      insertSql,
      [
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
      ],
      async (insertErr, result) => {
        if (insertErr) {
          console.error("Error creating object:", insertErr);
          return res.status(500).json({
            success: false,
            message: "Failed to create object",
            error: insertErr.message,
          });
        }

        await reorderSiblings(parentObjId || null);

        // Get the created object
        const createdObject = await new Promise((resolve, reject) => {
          db.query(
            "SELECT * FROM object WHERE obj_id = ?",
            [result.insertId],
            (err, results) => {
              if (err) return reject(err);
              resolve(results[0]);
            }
          );
        });

        return res.status(201).json({
          success: true,
          message: "Object created successfully",
          data: formatObjectData(createdObject),
        });
      }
    );
  } catch (error) {
    console.error("Error in createObject:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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
      return res.status(400).json({
        success: false,
        message: "Invalid Object ID",
      });
    }

    if (!objectName || !accessName) {
      return res.status(400).json({
        success: false,
        message: "Object name and access name are required",
      });
    }

    const currentData = await new Promise((resolve, reject) => {
      db.query(
        "SELECT parent_obj_id, `order`, is_menu FROM object WHERE obj_id = ?",
        [objId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!currentData) {
      return res.status(404).json({
        success: false,
        message: "Object not found",
      });
    }

    if (isMenu === "N" && parentObjId) {
      const parentExists = await new Promise((resolve, reject) => {
        db.query(
          "SELECT 1 FROM object WHERE obj_id = ? AND is_menu = 'Y' AND status = 'Y'",
          [parentObjId],
          (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0);
          }
        );
      });

      if (!parentExists) {
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
          return res.status(400).json({
            success: false,
            message: "Circular reference detected",
          });
        }

        const parentData = await new Promise((resolve, reject) => {
          db.query(
            "SELECT parent_obj_id FROM object WHERE obj_id = ?",
            [currentParent],
            (err, results) => {
              if (err) return reject(err);
              resolve(results[0]);
            }
          );
        });

        currentParent = parentData?.parent_obj_id;
      }
    }

    const parentObjIdValue = parentObjId === "" ? null : parentObjId;
    let newOrder = await getNextOrder(parentObjIdValue);

    if (currentData.parent_obj_id == parentObjIdValue) {
      newOrder = currentData.order;
    }

    const updatedBy = req.user?.username || "UNKNOWN";
    const updatedDate = new Date();

    const sql = `
      UPDATE object 
      SET 
        object_name = ?, 
        access_name = ?, 
        link_url = ?, 
        folder_path = ?, 
        slug = ?, 
        component_name = ?, 
        is_menu = ?, 
        icon = ?, 
        parent_obj_id = ?, 
        \`order\` = ?, 
        status = ?, 
        created_date = ?, 
        created_by = ? 
      WHERE obj_id = ?
    `;

    db.query(
      sql,
      [
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
      ],
      async (err, result) => {
        if (err) {
          console.error("Error updating object:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to update object",
            error: err.message,
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Object not found",
          });
        }

        await reorderSiblings(currentData.parent_obj_id || null, objId);
        if (currentData.parent_obj_id !== parentObjIdValue) {
          await reorderSiblings(parentObjIdValue || null);
        }

        // Get the updated object
        const updatedObject = await new Promise((resolve, reject) => {
          db.query(
            "SELECT * FROM object WHERE obj_id = ?",
            [objId],
            (err, results) => {
              if (err) return reject(err);
              resolve(results[0]);
            }
          );
        });

        return res.status(200).json({
          success: true,
          message: "Object updated successfully",
          data: formatObjectData(updatedObject),
        });
      }
    );
  } catch (error) {
    console.error("Error in updateObject:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete object
exports.deleteObject = async (req, res) => {
  const { objId } = req.params;

  if (!objId || isNaN(objId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Object ID",
    });
  }

  // Check if object exists and get parent info
  const objectData = await new Promise((resolve, reject) => {
    db.query(
      "SELECT parent_obj_id FROM object WHERE obj_id = ?",
      [objId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });

  if (!objectData) {
    return res.status(404).json({
      success: false,
      message: "Object not found",
    });
  }

  // Check if object has children
  const hasChildren = await new Promise((resolve, reject) => {
    db.query(
      "SELECT COUNT(*) as childCount FROM object WHERE parent_obj_id = ? AND status = 'Y'",
      [objId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0].childCount > 0);
      }
    );
  });

  if (hasChildren) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete object that has child items",
    });
  }

  const sql = "UPDATE object SET status = 'N' WHERE obj_id = ?";

  db.query(sql, [objId], async (err, result) => {
    if (err) {
      console.error("Error deleting object:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete object",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Object not found",
      });
    }

    await reorderSiblings(objectData.parent_obj_id || null);

    return res.status(200).json({
      success: true,
      message: "Object deleted successfully",
    });
  });
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
    const objIds = orders.map((item) => item.objId);

    if (objIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No objects to reorder",
      });
    }

    const existingObjects = await new Promise((resolve, reject) => {
      db.query(
        "SELECT obj_id FROM object WHERE obj_id IN (?) AND status = 'Y'",
        [objIds],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.map((item) => item.obj_id));
        }
      );
    });

    if (existingObjects.length !== orders.length) {
      return res.status(400).json({
        success: false,
        message: "Some objects not found or inactive",
      });
    }

    const parentMap = {};
    orders.forEach((item) => {
      parentMap[item.objId] = item.parentObjId;
    });

    const hasCircularReference = orders.some((item) => {
      let current = item.parentObjId;
      while (current) {
        if (current === item.objId) return true;
        current = parentMap[current];
      }
      return false;
    });

    if (hasCircularReference) {
      return res.status(400).json({
        success: false,
        message: "Circular reference detected in hierarchy",
      });
    }

    const parentGroups = {};
    orders.forEach((item) => {
      const parentKey = item.parentObjId || "null";
      if (!parentGroups[parentKey]) {
        parentGroups[parentKey] = [];
      }
      parentGroups[parentKey].push(item);
    });

    for (const [parentKey, items] of Object.entries(parentGroups)) {
      items.sort((a, b) => a.order - b.order);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE object SET \`order\` = ?, parent_obj_id = ? WHERE obj_id = ?`,
            [i + 1, item.parentObjId || null, item.objId],
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Objects reordered successfully",
      data: {
        reorderedCount: orders.length,
      },
    });
  } catch (err) {
    console.error("Error reordering objects:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reorder objects",
      error: err.message,
    });
  }
};

// Copy object
exports.copyObject = async (req, res) => {
  const { objId } = req.params;

  if (!objId || isNaN(objId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Object ID",
    });
  }

  try {
    const originalObject = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM object WHERE obj_id = ? AND status = 'Y'",
        [objId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!originalObject) {
      return res.status(404).json({
        success: false,
        message: "Object not found",
      });
    }

    const createdBy = req.user?.username || "UNKNOWN";
    const createdDate = new Date();
    const nextOrder = await getNextOrder(originalObject.parent_obj_id || null);

    // Generate copy name
    const copyName = `${originalObject.object_name} (Copy)`;

    const insertSql = `
      INSERT INTO object (
        object_name, access_name, link_url, folder_path, slug,
        component_name, is_menu, icon, parent_obj_id,
        \`order\`, status, created_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
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
      ],
      async (insertErr, result) => {
        if (insertErr) {
          console.error("Error copying object:", insertErr);
          return res.status(500).json({
            success: false,
            message: "Failed to copy object",
            error: insertErr.message,
          });
        }

        await reorderSiblings(originalObject.parent_obj_id || null);

        // Get the copied object
        const copiedObject = await new Promise((resolve, reject) => {
          db.query(
            "SELECT * FROM object WHERE obj_id = ?",
            [result.insertId],
            (err, results) => {
              if (err) return reject(err);
              resolve(results[0]);
            }
          );
        });

        return res.status(201).json({
          success: true,
          message: "Object copied successfully",
          data: formatObjectData(copiedObject),
        });
      }
    );
  } catch (error) {
    console.error("Error in copyObject:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
