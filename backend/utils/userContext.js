const db = require("../configuration/connection");

async function getUserContext(useId) {
  const [rows] = await db.query(
    `
    SELECT 
      u.use_id, u.username, u.email, u.status, u.rol_id, u.emp_id,
      r.role_name,
      e.emp_id, e.fullname,
      p.pos_id, p.position_name,
      d.div_id, d.division_name
    FROM user u
    LEFT JOIN role r ON u.rol_id = r.rol_id
    LEFT JOIN employee e ON u.emp_id = e.emp_id
    LEFT JOIN position p ON e.pos_id = p.pos_id
    LEFT JOIN division d ON e.div_id = d.div_id
    WHERE u.use_id = ?
    `,
    [useId]
  );

  if (rows.length === 0) return null;
  const u = rows[0];

  return {
    useId: u.use_id,
    username: u.username,
    email: u.email ?? null,
    status: u.status,
    rolId: u.rol_id ?? null,
    roleName: u.role_name ?? null,
    empId: u.emp_id ?? null,
    fullName: u.fullname ?? null,
    posId: u.pos_id ?? null,
    positionName: u.position_name ?? null,
    divId: u.div_id ?? null,
    divisionName: u.division_name ?? null,
  };
}

module.exports = { getUserContext };
