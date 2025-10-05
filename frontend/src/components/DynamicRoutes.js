import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMenuObjects, fetchObjects } from '../services/objectService'
import { fetchRoleAccess } from '../services/roleObjectService'
import DynamicComponentLoader from './DynamicComponentLoader'
import { setAccessData } from '../utils/permissionUtils'
import { setApiData, setDataLoaded } from '../redux/authSlice'

const DynamicRoutes = () => {
  const dispatch = useDispatch()
  const { apiData, isDataLoaded } = useSelector((state) => state.auth)
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(!isDataLoaded)

  useEffect(() => {
    const normalizeArray = (res) => {
      if (!res) return []
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res?.data?.data)) return res.data.data
      return []
    }

    const extractSelectedIds = (roleAccess) => {
      if (!Array.isArray(roleAccess)) return []
      if (roleAccess.length === 0) return []
      if (typeof roleAccess[0] === 'number' || typeof roleAccess[0] === 'string') {
        return roleAccess
          .map((v) => {
            const n = Number(v)
            return Number.isNaN(n) ? null : n
          })
          .filter(Boolean)
      }
      return roleAccess
        .map((r) => Number(r?.objId ?? r?.OBJ_ID ?? r?.objectId ?? r?.id))
        .filter((v) => Number.isFinite(v))
    }

    const sanitizePath = (p) => {
      if (!p) return null
      return String(p).replace(/{\s*([^/{}]+)\s*}/g, ':$1')
    }

    const load = async () => {
      if (isDataLoaded && apiData.allObjects && apiData.menuObjects && apiData.roleAccess) {
        processRoutes(apiData.allObjects, apiData.menuObjects, apiData.roleAccess)
        setLoading(false)
        return
      }

      try {
        const rolId = localStorage.getItem('rolId')

        const cachedApiData = JSON.parse(localStorage.getItem('apiData')) || null
        const isCacheValid =
          cachedApiData &&
          cachedApiData.lastFetched &&
          Date.now() - cachedApiData.lastFetched < 15 * 60 * 1000

        let normalizedAllObjects = []
        let normalizedMenuObjects = []
        let normalizedRoleAccess = []

        if (isCacheValid) {
          normalizedAllObjects = cachedApiData.allObjects || []
          normalizedMenuObjects = cachedApiData.menuObjects || []
          normalizedRoleAccess = cachedApiData.roleAccess || []

          dispatch(
            setApiData({
              allObjects: normalizedAllObjects,
              menuObjects: normalizedMenuObjects,
              roleAccess: normalizedRoleAccess,
              lastFetched: cachedApiData.lastFetched,
            }),
          )
        } else {
          const [allObjs, menuObjs, roleAcc] = await Promise.all([
            fetchObjects(),
            fetchMenuObjects(),
            fetchRoleAccess(rolId),
          ])

          normalizedAllObjects = normalizeArray(allObjs)
          normalizedMenuObjects = normalizeArray(menuObjs)
          normalizedRoleAccess = extractSelectedIds(roleAcc)

          const newApiData = {
            allObjects: normalizedAllObjects,
            menuObjects: normalizedMenuObjects,
            roleAccess: normalizedRoleAccess,
            lastFetched: Date.now(),
          }

          dispatch(setApiData(newApiData))
          localStorage.setItem('apiData', JSON.stringify(newApiData))
        }

        processRoutes(normalizedAllObjects, normalizedMenuObjects, normalizedRoleAccess)
        dispatch(setDataLoaded(true))
      } catch (err) {
        console.error('Failed to load dynamic routes:', err)
        setRoutes([])
      } finally {
        setLoading(false)
      }
    }

    const processRoutes = (allObjects, menuObjects, roleAccess) => {
      setAccessData(allObjects, roleAccess)

      const map = new Map()
      const pushIfValid = (obj) => {
        const rawLink = obj?.linkUrl || obj?.link_url || obj?.link || ''
        const status = obj?.status ?? obj?.STATUS ?? 'Y'
        if (!rawLink) return
        if (String(status).toUpperCase() !== 'Y') return
        const path = sanitizePath(rawLink)
        if (!path) return
        if (!map.has(path)) map.set(path, obj)
      }

      menuObjects.forEach(pushIfValid)
      allObjects.forEach(pushIfValid)

      const routeList = Array.from(map.entries()).map(([path, obj]) => ({
        path,
        obj,
      }))

      setRoutes(routeList)
    }

    load()
  }, [dispatch, isDataLoaded, apiData])

  if (loading) return <div className="p-3">Loading routes...</div>

  return (
    <Routes>
      {routes.map(({ path, obj }) => (
        <Route
          key={path}
          path={path}
          element={
            <DynamicComponentLoader
              componentInfo={{
                componentName: obj?.componentName || obj?.component || '',
                folderPath: obj?.folderPath || obj?.folder || '',
              }}
              routeName={obj?.objectName || obj?.object_name || ''}
            />
          }
        />
      ))}
      <Route path="*" element={<div className="p-4">Page not found</div>} />
    </Routes>
  )
}

export default DynamicRoutes
