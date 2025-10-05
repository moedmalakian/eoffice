import React, { useEffect, useState } from 'react'
import { AppSidebarNav } from './AppSidebarNav'
import { fetchMenuObjects, fetchObjects } from '../services/objectService'
import { fetchRoleAccess } from '../services/roleObjectService'
import { CNavGroup, CNavItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as icons from '@coreui/icons'
import { setAccessData } from '../utils/permissionUtils'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const DynamicNavigation = () => {
  const [navItems, setNavItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { token, user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      if (!token) {
        navigate('/login')
        return
      }

      const normalizeArray = (res) => {
        if (!res) return []
        if (Array.isArray(res)) return res
        if (Array.isArray(res?.data)) return res.data
        if (Array.isArray(res?.data?.data)) return res.data.data
        return []
      }

      const extractSelectedIds = (roleAccess) => {
        if (!roleAccess) return []
        if (Array.isArray(roleAccess)) return roleAccess
        if (roleAccess && Array.isArray(roleAccess.selectedObjects)) {
          return roleAccess.selectedObjects
        }
        if (roleAccess && Array.isArray(roleAccess.data?.selectedObjects)) {
          return roleAccess.data.selectedObjects
        }
        return []
      }

      try {
        let rolId = user?.rolId

        if (!rolId) {
          const userDetail = JSON.parse(localStorage.getItem('userDetail') || '{}')
          rolId = userDetail.rolId
        }

        if (!rolId) {
          try {
            const token = localStorage.getItem('token')
            if (token) {
              const decoded = jwtDecode(token)
              rolId = decoded.rolId
            }
          } catch (e) {
            console.error('Failed to decode token:', e)
          }
        }

        if (!rolId) {
          throw new Error('Role ID not found in any source')
        }

        const cachedApiData = JSON.parse(localStorage.getItem('apiData')) || null
        const isCacheValid =
          cachedApiData &&
          cachedApiData.lastFetched &&
          Date.now() - cachedApiData.lastFetched < 15 * 60 * 1000

        if (isCacheValid) {
          const { allObjects, menuObjects, roleAccess } = cachedApiData
          setAccessData(allObjects, roleAccess)
          processNavigation(allObjects, menuObjects, roleAccess)
        } else {
          const [allObjectsRes, menuObjectsRes, roleAccessRes] = await Promise.all([
            fetchObjects(),
            fetchMenuObjects(),
            fetchRoleAccess(rolId),
          ])

          const allObjects = normalizeArray(allObjectsRes)
          const menuObjects = normalizeArray(menuObjectsRes)
          const selectedObjects = extractSelectedIds(roleAccessRes)

          localStorage.setItem(
            'apiData',
            JSON.stringify({
              allObjects,
              menuObjects,
              roleAccess: selectedObjects,
              lastFetched: Date.now(),
            }),
          )

          setAccessData(allObjects, selectedObjects)
          processNavigation(allObjects, menuObjects, selectedObjects)
        }
      } catch (err) {
        console.error('Failed to load navigation:', err)
        setNavItems([])
      } finally {
        setLoading(false)
      }
    }

    const processNavigation = (allObjects, menuObjects, roleAccess) => {
      const activeMenuItems = menuObjects.filter((item) => {
        const status = item?.status ?? item?.STATUS ?? 'Y'
        const isMenu = item?.isMenu ?? item?.is_menu ?? item?.IS_MENU ?? 'N'
        const objId = Number(item?.objId ?? item?.OBJ_ID ?? item?.id)
        return (
          String(status).toUpperCase() === 'Y' &&
          String(isMenu).toUpperCase() === 'Y' &&
          roleAccess.includes(objId)
        )
      })

      const getIconComponent = (iconName) => {
        if (!iconName) return icons.cilSettings
        const key = Object.keys(icons).find((k) => k.toLowerCase() === iconName.toLowerCase())
        return key ? icons[key] : icons.cilSettings
      }

      const rootItems = activeMenuItems.filter(
        (i) => !i.parentObjId && !i.parent_obj_id && !i.parentId,
      )
      const childItems = activeMenuItems.filter(
        (i) => i.parentObjId || i.parent_obj_id || i.parentId,
      )

      const formatted = rootItems.map((root) => {
        const objId = root?.objId ?? root?.OBJ_ID ?? root?.id
        const children = childItems.filter((c) => {
          const pid = c?.parentObjId ?? c?.parent_obj_id ?? c?.parentId
          return Number(pid) === Number(objId)
        })

        const IconComponent = getIconComponent(root.icon)
        if (children.length > 0) {
          return {
            component: CNavGroup,
            name: root.objectName,
            icon: <CIcon icon={IconComponent} customClassName="nav-icon" />,
            to: root.linkUrl,
            items: children.map((child) => {
              const ChildIconComponent = getIconComponent(child.icon)
              return {
                component: CNavItem,
                name: child.objectName,
                to: child.linkUrl,
                icon: <CIcon icon={ChildIconComponent} customClassName="nav-icon" />,
              }
            }),
          }
        } else {
          return {
            component: CNavItem,
            name: root.objectName,
            to: root.linkUrl,
            icon: <CIcon icon={IconComponent} customClassName="nav-icon" />,
          }
        }
      })

      setNavItems(formatted)
    }

    if (token) {
      load()
    } else {
      setLoading(false)
    }
  }, [token, navigate, user?.rolId])

  if (loading) {
    return (
      <AppSidebarNav
        items={[
          {
            component: CNavItem,
            name: 'Loading...',
            to: '#',
          },
        ]}
      />
    )
  }

  return <AppSidebarNav items={navItems} />
}

export default DynamicNavigation
