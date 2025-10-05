import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilMinus } from '@coreui/icons'
import {
  fetchObjects,
  fetchRoleAccess,
  createRoleAccess,
} from '../../../services/roleObjectService'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const RoleAccess = ({ showModal, onClose, rolId, onSuccess }) => {
  const navigate = useNavigate()
  const [objects, setObjects] = useState([])
  const [selectedObjects, setSelectedObjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedItems, setExpandedItems] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canAccess, setCanAccess] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanAccess(hasAccessSync('RoleAccess'))
  }, [])

  useEffect(() => {
    if (accessReady && !canAccess) {
      const url = getObjectLink('RoleList')
      navigate(url || '/')
    }
  }, [accessReady, canAccess, navigate])

  const loadObjects = async () => {
    try {
      const response = await fetchObjects()
      if (Array.isArray(response)) {
        const normalized = response.map((o) => ({
          ...o,
          objId: String(o.objId),
          parentObjId:
            o.parentObjId === null || o.parentObjId === undefined ? null : String(o.parentObjId),
        }))
        setObjects(normalized)
      } else {
        throw new Error('Invalid object data')
      }
    } catch (err) {
      setError('Failed to fetch objects')
    }
  }

  const loadRoleAccess = async (rolId) => {
    try {
      const selected = await fetchRoleAccess(rolId)
      if (Array.isArray(selected)) {
        setSelectedObjects(selected.map((id) => String(id)))
      } else {
        throw new Error('Invalid role access data')
      }
    } catch (err) {
      setError('Failed to fetch role access')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!showModal) return
      setLoading(true)
      setError(null)
      try {
        await loadObjects()
        if (rolId) {
          await loadRoleAccess(rolId)
        } else {
          setSelectedObjects([])
        }
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showModal, rolId])

  const getAllChildrenIds = (parentId) => {
    const directChildren = objects.filter((obj) => String(obj.parentObjId) === String(parentId))
    let allIds = directChildren.map((c) => c.objId)
    directChildren.forEach((child) => {
      allIds = [...allIds, ...getAllChildrenIds(child.objId)]
    })
    return allIds
  }

  const getDirectChildren = (parentId) =>
    objects.filter((obj) => String(obj.parentObjId) === String(parentId)).map((c) => c.objId)

  const getParentChain = (childId) => {
    const child = objects.find((obj) => String(obj.objId) === String(childId))
    if (!child || !child.parentObjId) return []
    const parentId = String(child.parentObjId)
    return [parentId, ...getParentChain(parentId)]
  }

  const handleObjectSelection = (objId) => {
    const objIdStr = String(objId)
    const childIds = getAllChildrenIds(objIdStr)
    const idsToToggle = [objIdStr, ...childIds]

    setSelectedObjects((prev) => {
      const prevSet = new Set(prev.map((p) => String(p)))
      const isSelected = prevSet.has(objIdStr)
      let newSelected = new Set(prevSet)

      if (isSelected) {
        idsToToggle.forEach((id) => newSelected.delete(String(id)))
      } else {
        idsToToggle.forEach((id) => newSelected.add(String(id)))
      }

      const parentChain = getParentChain(objIdStr)
      parentChain.forEach((parentId) => {
        const directChildren = getDirectChildren(parentId)
        const anyChildSelected = directChildren.some((cid) => newSelected.has(String(cid)))
        if (anyChildSelected) {
          newSelected.add(String(parentId))
        } else {
          newSelected.delete(String(parentId))
        }
      })

      return Array.from(newSelected)
    })
  }

  const getAllObjectIds = () => objects.map((item) => item.objId)

  const handleSelectAll = (e) => {
    const checked = e.target.checked
    const allIds = getAllObjectIds()
    setSelectedObjects(checked ? allIds : [])
  }

  const isAllSelected = () => {
    const allIds = getAllObjectIds()
    return allIds.length > 0 && allIds.every((id) => selectedObjects.includes(id))
  }

  const getExpandableObjectIds = () => {
    const expandable = new Set()
    objects.forEach((obj) => {
      const hasChildren = objects.some((child) => String(child.parentObjId) === String(obj.objId))
      if (hasChildren) expandable.add(obj.objId)
    })
    return Array.from(expandable)
  }

  const handleToggleExpandAll = () => {
    const expandableIds = getExpandableObjectIds()
    const allExpanded = expandableIds.every((id) => expandedItems.includes(id))
    setExpandedItems(allExpanded ? [] : expandableIds)
  }

  const isAllExpanded = () => {
    const expandableIds = getExpandableObjectIds()
    return expandableIds.length > 0 && expandableIds.every((id) => expandedItems.includes(id))
  }

  const handleExpandCollapse = (objId) => {
    setExpandedItems((prev) =>
      prev.includes(objId) ? prev.filter((id) => id !== objId) : [...prev, objId],
    )
  }

  const confirmSave = () => {
    if (!rolId) return setError('Invalid Role ID')
    if (selectedObjects.length === 0) {
      setShowConfirmModal(true)
    } else {
      doSave()
    }
  }

  const doSave = async () => {
    try {
      await createRoleAccess(rolId, selectedObjects)
      showSuccessUpdateToast('Role access saved successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      showErrorUpdateToast('Failed to save role access.')
      setError('Failed to save role access')
    } finally {
      setShowConfirmModal(false)
    }
  }

  const renderTableRows = (parentId = null, level = 0) => {
    const normalizeId = (id) => (id === null || id === undefined ? null : String(id))
    const parentStr = normalizeId(parentId)

    return objects
      .filter((obj) => normalizeId(obj.parentObjId) === parentStr)
      .map((item) => (
        <React.Fragment key={item.objId}>
          <CTableRow>
            <CTableDataCell>
              {objects.some((child) => String(child.parentObjId) === String(item.objId)) && (
                <CButton color="link" size="sm" onClick={() => handleExpandCollapse(item.objId)}>
                  <CIcon icon={expandedItems.includes(item.objId) ? cilMinus : cilPlus} />
                </CButton>
              )}
            </CTableDataCell>
            <CTableDataCell
              style={{ paddingLeft: `${level > 0 ? level * 1 : 0.4}rem`, whiteSpace: 'nowrap' }}
            >
              {level === 2 && '└ '} {item.objectName}
            </CTableDataCell>
            <CTableDataCell>{item.linkUrl}</CTableDataCell>
            <CTableDataCell>{item.slug}</CTableDataCell>
            <CTableDataCell>{item.accessName}</CTableDataCell>
            <CTableDataCell>
              <CBadge color={item.isMenu === 'Y' ? 'primary' : 'dark'}>
                {item.isMenu === 'Y' ? 'Yes' : 'No'}
              </CBadge>
            </CTableDataCell>
            <CTableDataCell>
              <CFormCheck
                checked={selectedObjects.includes(item.objId)}
                onChange={() => handleObjectSelection(item.objId)}
              />
            </CTableDataCell>
          </CTableRow>
          {expandedItems.includes(item.objId) && renderTableRows(item.objId, level + 1)}
        </React.Fragment>
      ))
  }

  return (
    <>
      <CModal visible={showModal} onClose={onClose} size="xl" portal={false}>
        <CModalHeader closeButton>Access Menu</CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="text-center">
              <CSpinner color="primary" />
              <p>Loading objects...</p>
            </div>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>
                    <CButton
                      color="link"
                      size="sm"
                      onClick={handleToggleExpandAll}
                      title={isAllExpanded() ? 'Collapse All' : 'Expand All'}
                    >
                      <CIcon icon={isAllExpanded() ? cilMinus : cilPlus} />
                    </CButton>
                  </CTableHeaderCell>
                  <CTableHeaderCell>Object Name</CTableHeaderCell>
                  <CTableHeaderCell>URL</CTableHeaderCell>
                  <CTableHeaderCell>Slug</CTableHeaderCell>
                  <CTableHeaderCell>Access Name</CTableHeaderCell>
                  <CTableHeaderCell>Menu</CTableHeaderCell>
                  <CTableHeaderCell>
                    <CFormCheck
                      checked={isAllSelected()}
                      onChange={handleSelectAll}
                      title="Check/Uncheck All"
                    />
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>{renderTableRows(null, 0)}</CTableBody>
            </CTable>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Close
          </CButton>
          <CButton color="primary" onClick={confirmSave}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)} portal={false}>
        <CModalHeader closeButton>Confirm Remove Access</CModalHeader>
        <CModalBody>
          <p>
            You have unchecked all menu access. Are you sure you want to remove all access for this
            role?
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={doSave}>
            Yes, Remove All
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default RoleAccess
