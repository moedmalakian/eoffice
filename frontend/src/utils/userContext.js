import { jwtDecode } from 'jwt-decode'
import { fetchUserById } from '../services/userService'
import { fetchObjects, fetchMenuObjects } from '../services/objectService'
import { fetchRoleAccess } from '../services/roleObjectService'

/**
 * Normalize array response
 */
const normalizeArray = (res) => {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data?.selectedObjects)) return res.data.selectedObjects
  return []
}

/**
 * Normalize user detail response
 */
const normalizeUserDetail = (payload, decoded) => {
  const src = payload?.data ?? payload ?? {}
  const employee = src.employee ?? {}

  return {
    useId: src.useId ?? src.use_id ?? decoded?.useId,
    username: src.username ?? decoded?.username,
    email: src.email ?? src.user_email ?? null,
    rolId: src.rolId ?? src.rol_id ?? decoded?.rolId,
    roleName: src.roleName ?? src.role_name ?? null,
    empId: src.empId ?? src.emp_id ?? employee.empId ?? employee.emp_id ?? null,
    fullName: src.fullName ?? src.fullname ?? employee.fullName ?? employee.fullname ?? null,
    posId: src.posId ?? src.pos_id ?? employee.posId ?? employee.pos_id ?? null,
    positionName:
      src.positionName ??
      src.position_name ??
      employee.positionName ??
      employee.position_name ??
      null,
    divId: src.divId ?? src.div_id ?? employee.divId ?? employee.div_id ?? null,
    divisionName:
      src.divisionName ??
      src.division_name ??
      employee.divisionName ??
      employee.division_name ??
      null,
  }
}

/**
 * Extract role access
 */
const extractSelectedIds = (roleAccess) => {
  if (!roleAccess) return []

  if (roleAccess.data && Array.isArray(roleAccess.data.selectedObjects)) {
    return roleAccess.data.selectedObjects
  }

  if (Array.isArray(roleAccess.selectedObjects)) {
    return roleAccess.selectedObjects
  }

  if (Array.isArray(roleAccess)) {
    return roleAccess
  }

  if (roleAccess.success && roleAccess.data && Array.isArray(roleAccess.data.selectedObjects)) {
    return roleAccess.data.selectedObjects
  }

  return []
}

/**
 * Build user context
 */
export const buildUserContext = async (token) => {
  if (!token) {
    throw new Error('Missing token')
  }

  const decoded = jwtDecode(token)
  const { useId, rolId, username } = decoded

  let userDetail
  try {
    const userRes = await fetchUserById(useId)
    userDetail = normalizeUserDetail(userRes, decoded)
  } catch (err) {
    userDetail = {
      useId,
      username,
      rolId: rolId,
      email: null,
      roleName: null,
      empId: null,
      fullName: null,
      posId: null,
      positionName: null,
      divId: null,
      divisionName: null,
    }
  }

  let allObjects = []
  let menuObjects = []
  let selectedObjects = []

  try {
    const [allRes, menuRes, roleRes] = await Promise.allSettled([
      fetchObjects(),
      fetchMenuObjects(),
      fetchRoleAccess(rolId),
    ])

    if (allRes.status === 'fulfilled') {
      allObjects = normalizeArray(allRes.value)
    }

    if (menuRes.status === 'fulfilled') {
      menuObjects = normalizeArray(menuRes.value)
    }

    if (roleRes.status === 'fulfilled') {
      selectedObjects = extractSelectedIds(roleRes.value)
    }
  } catch (err) {
    throw new Error('Failed to fetch role/menu/objects data')
  }

  const accessibleMenuObjects = menuObjects.filter((menuItem) => {
    const menuItemId = Number(menuItem.objId ?? menuItem.OBJ_ID ?? menuItem.id)
    return selectedObjects.includes(menuItemId)
  })

  return {
    token,
    decoded,
    user: {
      ...userDetail,
      rolId: userDetail.rolId || rolId,
    },
    apiData: {
      allObjects,
      menuObjects: accessibleMenuObjects,
      roleAccess: selectedObjects,
      lastFetched: Date.now(),
    },
  }
}

/**
 * Quick context builder
 */
export const buildQuickContext = (token) => {
  if (!token) return null

  try {
    const decoded = jwtDecode(token)
    return {
      token,
      decoded,
      user: {
        useId: decoded.useId,
        username: decoded.username,
        rolId: decoded.rolId,
      },
      apiData: {
        allObjects: [],
        menuObjects: [],
        roleAccess: [],
        lastFetched: Date.now(),
      },
    }
  } catch (err) {
    return null
  }
}

/**
 * Validate context data
 */
export const validateContext = (context) => {
  if (!context) return false
  if (!context.user || !context.user.rolId) return false
  if (!context.apiData || !Array.isArray(context.apiData.menuObjects)) return false
  return true
}

export default { buildUserContext, buildQuickContext, validateContext }
