const STORAGE_KEY = 'access-cache-v1'

let allObjectsCache = []

let accessMap = {
  byId: new Set(),
  byComponent: new Set(),
  byObjects: [],
}

let accessReady = false

const toLower = (v) => String(v || '').toLowerCase()

const getObjId = (obj) =>
  Number(obj?.objId ?? obj?.OBJ_ID ?? obj?.id ?? obj?.objectId ?? obj?.obj_id ?? NaN)

const parseSelectedObjects = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return []
  if (typeof arr[0] === 'number' || typeof arr[0] === 'string') {
    return arr
      .map((v) => {
        const n = Number(v)
        return Number.isFinite(n) ? n : null
      })
      .filter((v) => v !== null)
  }
  return arr.map((o) => getObjId(o)).filter((v) => Number.isFinite(v))
}

/**
 *
 * Bangun peta akses dari allObjects + selectedObjects (array angka objId).
 *
 **/
const buildAccessMap = (allObjects = [], selectedObjects = []) => {
  const byId = new Set(selectedObjects.map((v) => Number(v)))
  const byComponent = new Set()
  const accessibleObjects = (allObjects || []).filter((obj) => byId.has(getObjId(obj)))

  accessibleObjects.forEach((obj) => {
    if (obj?.componentName) byComponent.add(toLower(obj.componentName))
    if (obj?.objCode) byComponent.add(toLower(obj.objCode))
    if (obj?.objectName) byComponent.add(toLower(obj.objectName))
  })

  return { byId, byComponent, byObjects: accessibleObjects }
}

/**
 *
 * Simpan data akses:
 * - allObjects: semua objek (menu + non-menu)
 * - selectedObjectsRaw: array objId (atau array object yang punya objId)
 *
 **/
export const setAccessData = (allObjects = [], selectedObjectsRaw = []) => {
  try {
    allObjectsCache = Array.isArray(allObjects) ? allObjects : []
    const selectedObjects = parseSelectedObjects(selectedObjectsRaw)
    accessMap = buildAccessMap(allObjectsCache, selectedObjects)
    accessReady = true
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ allObjects: allObjectsCache, selectedObjects }),
    )
  } catch {}
}

export const hydrateAccessFromStorage = () => {
  if (accessReady) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    const { allObjects, selectedObjects } = parsed || {}
    if (Array.isArray(allObjects) && Array.isArray(selectedObjects)) {
      allObjectsCache = allObjects
      accessMap = buildAccessMap(allObjectsCache, selectedObjects)
      accessReady = true
    }
  } catch {}
}

export const ensureAccessHydrated = () => {
  if (!accessReady || (accessMap.byObjects && accessMap.byObjects.length === 0)) {
    hydrateAccessFromStorage()
  }
  return accessReady
}

/**
 * Cek akses:
 * - number -> cek objId
 * - string -> cek componentName / objCode / objectName (lowercase)
 *
 **/
export const hasAccess = (key) => {
  if (key === undefined || key === null) return false
  ensureAccessHydrated()
  if (typeof key === 'number' || (!isNaN(Number(key)) && String(key).trim() !== '')) {
    return accessMap.byId.has(Number(key))
  }
  return accessMap.byComponent.has(toLower(String(key)))
}

export const hasAccessSync = hasAccess

/**
 *
 * Ambil object berdasarkan componentName / objCode / objectName
 * (dicari di allObjectsCache supaya tidak tergantung hanya pada menu)
 *
 **/
export const getObjectByComponent = (componentName) => {
  ensureAccessHydrated()
  if (!componentName) return null
  const target = toLower(componentName)
  return (
    allObjectsCache.find(
      (obj) =>
        toLower(obj?.componentName) === target ||
        toLower(obj?.objCode) === target ||
        toLower(obj?.objectName) === target,
    ) || null
  )
}

/**
 *
 * Ambil linkUrl dan replace param dinamis:
 * - Mendukung ':param' atau '{param}' di data object.
 * - Contoh: getObjectLink('EmployeeDetail', { empId: 1 }) => '/master-data/employee/detail/1'
 * - Jika masih ada placeholder yang belum terisi, return null (biar tidak navigate ke URL salah).
 *
 **/
export const getObjectLink = (componentName, params = {}) => {
  const obj = getObjectByComponent(componentName)
  if (!obj) return null

  const rawUrl = obj.linkUrl || obj.link_url || obj.link || ''
  if (!rawUrl) return null

  let url = String(rawUrl).replace(/{\s*([^/{}]+)\s*}/g, ':$1')

  if (params && typeof params === 'object') {
    Object.keys(params).forEach((k) => {
      const v = params[k]
      if (v === undefined || v === null) return
      url = url.replace(new RegExp(`:${k}\\b`, 'g'), String(v))
    })
  }

  if (/:([A-Za-z0-9_]+)/.test(url)) {
    return null
  }

  url = url.replace(/([^:]\/)\/+/g, '$1')

  return url
}

/** Bersihkan cache (mis. saat logout) */
export const clearAccessData = () => {
  allObjectsCache = []
  accessMap = { byId: new Set(), byComponent: new Set(), byObjects: [] }
  accessReady = false
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
