import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CBadge,
  CTooltip,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch, cilPlus, cilMinus, cilCopy } from '@coreui/icons'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import Search from '../../../components/Search'
import useDebounce from '../../../utils/useDebounce'
import ObjectCreate from './ObjectCreate'
import ObjectEdit from './ObjectEdit'
import ObjectDetail from './ObjectDetail'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import {
  fetchObjects,
  deleteObject,
  reorderObject,
  copyObject,
} from '../../../services/objectService'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const levelColors = ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd']

const SortableTableRow = ({
  id,
  item,
  handleEdit,
  handleViewDetail,
  openDeleteModal,
  handleCopyObject,
  level,
  toggleExpand,
  isExpanded,
  hasChildren,
  activeId,
  overId,
  canDetail,
  canEdit,
  canDelete,
  canCopy,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id,
    })

  const isActive = activeId === id
  const isOverItem = isOver && !isActive
  const isParentDrop = overId === id && hasChildren && isExpanded

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    position: 'relative',
    backgroundColor: isOverItem ? '#f0f7ff' : 'inherit',
    borderLeft: isParentDrop ? '3px solid #3c8dbc' : 'none',
  }

  const levelColor = levelColors[Math.min(level, levelColors.length - 1)]

  return (
    <CTableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'dragging-row' : ''} ${isOverItem ? 'hover-row' : ''}`}
    >
      <CTableDataCell style={{ width: '50px', textAlign: 'center', verticalAlign: 'middle' }}>
        {hasChildren && (
          <CButton
            color="link"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              toggleExpand(item.objId)
            }}
            style={{ color: '#495057', padding: '4px' }}
          >
            <CIcon icon={isExpanded ? cilMinus : cilPlus} />
          </CButton>
        )}
      </CTableDataCell>
      <CTableDataCell
        style={{ paddingLeft: `${5 + level * 5}px`, minWidth: '200px', verticalAlign: 'middle' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {level > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
              {Array.from({ length: level }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '16px',
                    height: '16px',
                    position: 'relative',
                  }}
                >
                  {i === level - 1 && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '0',
                          bottom: '0',
                          width: '2px',
                          backgroundColor: '#dee2e6',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          width: '8px',
                          height: '2px',
                          backgroundColor: '#dee2e6',
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <span style={{ whiteSpace: 'nowrap' }}>{item.objectName}</span>
        </div>
      </CTableDataCell>
      <CTableDataCell style={{ minWidth: '150px', verticalAlign: 'middle' }}>
        {item.accessName}
      </CTableDataCell>
      <CTableDataCell style={{ minWidth: '150px', verticalAlign: 'middle' }}>
        {item.componentName || '-'}
      </CTableDataCell>
      <CTableDataCell style={{ width: '120px', verticalAlign: 'middle' }}>
        <CBadge color={item.isMenu === 'Y' ? 'primary' : 'secondary'}>
          {item.isMenu === 'Y' ? 'Menu' : 'Action'}
        </CBadge>
      </CTableDataCell>
      <CTableDataCell style={{ width: '100px', verticalAlign: 'middle' }}>
        <CBadge color={item.status === 'Y' ? 'success' : 'danger'}>
          {item.status === 'Y' ? 'Active' : 'Inactive'}
        </CBadge>
      </CTableDataCell>
      <CTableDataCell style={{ width: '170px', verticalAlign: 'middle' }}>
        {formatDateWithTime(item.createdDate)}
      </CTableDataCell>
      <CTableDataCell style={{ width: '150px', verticalAlign: 'middle' }}>
        {item.createdBy}
      </CTableDataCell>
      <CTableDataCell style={{ width: '180px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {canDetail && (
            <CTooltip content="View Data">
              <CButton
                color="info"
                variant="outline"
                size="sm"
                onClick={() => handleViewDetail(item.objId)}
                style={{ minWidth: '32px' }}
              >
                <CIcon icon={cilSearch} />
              </CButton>
            </CTooltip>
          )}

          {canEdit && (
            <CTooltip content="Edit Data">
              <CButton
                color="warning"
                variant="outline"
                size="sm"
                onClick={() => handleEdit(item.objId)}
                style={{ minWidth: '32px' }}
              >
                <CIcon icon={cilPencil} />
              </CButton>
            </CTooltip>
          )}

          {canCopy && (
            <CTooltip content="Copy Object">
              <CButton
                color="success"
                variant="outline"
                size="sm"
                onClick={() => handleCopyObject(item)}
                style={{ minWidth: '32px' }}
              >
                <CIcon icon={cilCopy} />
              </CButton>
            </CTooltip>
          )}

          {canDelete && (
            <CTooltip content="Delete Data">
              <CButton
                color="danger"
                variant="outline"
                size="sm"
                onClick={() => openDeleteModal(item)}
                style={{ minWidth: '32px' }}
              >
                <CIcon icon={cilTrash} />
              </CButton>
            </CTooltip>
          )}
        </div>
      </CTableDataCell>
    </CTableRow>
  )
}

const ObjectList = () => {
  const [objects, setObjects] = useState([])
  const [flatObjects, setFlatObjects] = useState([])
  const [expandedItems, setExpandedItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedObject, setSelectedObject] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [copyLoading, setCopyLoading] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 500)
  const { showSuccessToast, showErrorToast, showSuccessDeleteToast, showErrorDeleteToast } =
    useToast()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDetail, setCanDetail] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [canCopy, setCanCopy] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('ObjectCreate'))
    setCanEdit(hasAccessSync('ObjectEdit'))
    setCanDetail(hasAccessSync('ObjectDetail'))
    setCanDelete(hasAccessSync('ObjectDelete'))
    setCanCopy(hasAccessSync('ObjectCopy'))
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const findItemsUpToLevel1 = useCallback((nodes) => {
    const result = []
    nodes.forEach((node) => {
      if (node.children?.length > 0) {
        result.push(node.objId)
      }
    })
    return result
  }, [])

  const loadObjects = useCallback(async () => {
    if (loading) return

    setLoading(true)
    try {
      const res = await fetchObjects({ search: debouncedSearch })

      if (!res.data || res.data.length === 0) {
        setObjects([])
        setFlatObjects([])
        setHasLoaded(true)
        return
      }

      const sorted = res.data.sort((a, b) => {
        const parentA = a.parentObjId || 0
        const parentB = b.parentObjId || 0

        if (parentA !== parentB) {
          return parentA - parentB
        }

        return a.order - b.order
      })

      setObjects(sorted)
      setHasLoaded(true)

      if (expandedItems.length === 0) {
        setExpandedItems([])
      }
    } catch (error) {
      console.error('Error loading objects:', error)
      showErrorToast('Failed to load data')
      setHasLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, showErrorToast, findItemsUpToLevel1, expandedItems, loading])

  const buildHierarchy = useCallback((items) => {
    const map = {}
    const roots = []

    items.forEach((item) => {
      map[item.objId] = { ...item, children: [] }
    })

    items.forEach((item) => {
      if (item.parentObjId && map[item.parentObjId]) {
        map[item.parentObjId].children.push(map[item.objId])
      } else {
        roots.push(map[item.objId])
      }
    })

    Object.values(map).forEach((node) => {
      if (node.children.length > 0) {
        node.children.sort((a, b) => a.order - b.order)
      }
    })

    return roots.sort((a, b) => a.order - b.order)
  }, [])

  const flattenHierarchy = useCallback(
    (nodes, level = 0, parentId = null) => {
      return nodes.reduce((acc, node) => {
        const newNode = {
          ...node,
          level,
          parentObjId: parentId,
          hasChildren: node.children?.length > 0,
        }

        const children =
          expandedItems.includes(node.objId) && node.children?.length > 0
            ? flattenHierarchy(node.children, level + 1, node.objId)
            : []

        return [...acc, newNode, ...children]
      }, [])
    },
    [expandedItems],
  )

  const hierarchy = useMemo(() => buildHierarchy(objects), [objects, buildHierarchy])

  useEffect(() => {
    if (hierarchy.length > 0) {
      const flat = flattenHierarchy(hierarchy)
      setFlatObjects(flat)
    } else {
      setFlatObjects([])
    }
  }, [hierarchy, flattenHierarchy])

  useEffect(() => {
    if (!hasLoaded || debouncedSearch !== '') {
      loadObjects()
    }
  }, [loadObjects, debouncedSearch, hasLoaded])

  // handleCopyObject
  const handleCopyObject = async (obj) => {
    if (!obj || !obj.objId) return

    setCopyLoading(true)
    try {
      const result = await copyObject(obj.objId)

      if (result.success) {
        showSuccessToast(`Object "${obj.objectName}" copied successfully`)
        loadObjects()
      } else {
        showErrorToast(result.message || 'Failed to copy object')
      }
    } catch (error) {
      console.error('Error copying object:', error)
      showErrorToast(error.response?.data?.message || 'Failed to copy object')
    } finally {
      setCopyLoading(false)
    }
  }

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    setOverId(null)
  }

  const handleDragOver = (event) => {
    const { over } = event
    if (over) {
      setOverId(over.id)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      setOverId(null)
      return
    }

    try {
      setIsReordering(true)

      const activeItem = flatObjects.find((item) => item.objId === active.id)
      const overItem = flatObjects.find((item) => item.objId === over.id)

      if (!activeItem || !overItem) return

      const oldIndex = flatObjects.findIndex((item) => item.objId === active.id)
      const newIndex = flatObjects.findIndex((item) => item.objId === over.id)

      let newParentObjId = overItem.parentObjId
      let newLevel = overItem.level

      if (overItem.hasChildren && expandedItems.includes(overItem.objId)) {
        newParentObjId = overItem.objId
        newLevel = overItem.level + 1
      } else if (overItem.level > activeItem.level) {
        newParentObjId = overItem.parentObjId
        newLevel = overItem.level
      } else if (overItem.level < activeItem.level) {
        newParentObjId = overItem.parentObjId
        newLevel = overItem.level
      } else {
        newParentObjId = overItem.parentObjId
        newLevel = overItem.level
      }

      const newFlatItems = arrayMove(flatObjects, oldIndex, newIndex).map((item, index) => {
        if (item.objId === active.id) {
          return {
            ...item,
            order: index + 1,
            level: newLevel,
            parentObjId: newParentObjId,
          }
        }
        return {
          ...item,
          order: index + 1,
        }
      })

      setFlatObjects(newFlatItems)

      const updates = newFlatItems.map((item) => ({
        objId: item.objId,
        order: item.order,
        parentObjId: item.parentObjId,
      }))

      await reorderObject(updates)
      showSuccessToast('Hierarchy updated successfully')

      loadObjects()
    } catch (err) {
      console.error('Reorder error:', err)
      showErrorToast('Failed to update hierarchy')
      loadObjects()
    } finally {
      setIsReordering(false)
      setActiveId(null)
      setOverId(null)
    }
  }

  const toggleExpand = (id) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleExpandAll = () => {
    if (hierarchy.length === 0) return

    const getAllItemsWithChildren = (nodes) => {
      let result = []
      nodes.forEach((node) => {
        if (node.children?.length > 0) {
          result.push(node.objId)
          result = [...result, ...getAllItemsWithChildren(node.children)]
        }
      })
      return result
    }

    if (expandedItems.length === 0) {
      const allItemsWithChildren = getAllItemsWithChildren(hierarchy)
      setExpandedItems(allItemsWithChildren)
    } else {
      setExpandedItems([])
    }
  }

  const handleViewDetail = (id) => {
    const object = objects.find((o) => o.objId === id)
    if (object) {
      setSelectedObject(object)
      setShowDetailModal(true)
    }
  }

  const handleEdit = (id) => {
    const object = objects.find((o) => o.objId === id)
    if (object) {
      setSelectedObject(object)
      setShowEditModal(true)
    }
  }

  const openDeleteModal = (obj) => {
    setSelectedObject(obj)
    setDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setSelectedObject(null)
    setDeleteModal(false)
  }

  const handleDelete = async () => {
    if (!selectedObject) return

    try {
      await deleteObject(selectedObject.objId)
      showSuccessDeleteToast()
      loadObjects()
      closeDeleteModal()
    } catch {
      showErrorDeleteToast()
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadObjects()
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    loadObjects()
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Master Data - Object</h4>
        {accessReady && canCreate && (
          <CButton color="primary" onClick={() => setShowCreateModal(true)}>
            Create Object
          </CButton>
        )}
      </div>

      <div className="mb-3">
        <Search onSearch={setSearchTerm} placeholder="Search object..." />
      </div>

      {loading || copyLoading ? (
        <div className="text-center py-5">
          <CSpinner />
          {copyLoading && <p className="mt-2">Copying object...</p>}
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm">
          {isReordering && (
            <div className="text-center py-2 bg-light">
              <CSpinner size="sm" />
              <span className="ms-2">Updating order...</span>
            </div>
          )}

          {objects.length === 0 && hasLoaded ? (
            <div className="text-center py-5">
              <CAlert color="info">
                No objects found.{' '}
                {debouncedSearch ? 'Try a different search term.' : 'Create your first object.'}
              </CAlert>
            </div>
          ) : (
            <div className="table-responsive">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={flatObjects.map((item) => item.objId)}
                  strategy={verticalListSortingStrategy}
                >
                  <CTable hover striped className="m-0">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell style={{ width: '50px' }}>
                          {objects.length > 0 && (
                            <CButton
                              color="link"
                              size="sm"
                              onClick={toggleExpandAll}
                              style={{ color: '#495057', padding: '4px' }}
                            >
                              <CIcon icon={expandedItems.length === 0 ? cilPlus : cilMinus} />
                            </CButton>
                          )}
                        </CTableHeaderCell>
                        <CTableHeaderCell>Object Name</CTableHeaderCell>
                        <CTableHeaderCell>Access Name</CTableHeaderCell>
                        <CTableHeaderCell>Component Name</CTableHeaderCell>
                        <CTableHeaderCell>Type</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Created Date</CTableHeaderCell>
                        <CTableHeaderCell>Created By</CTableHeaderCell>
                        <CTableHeaderCell>Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {flatObjects.map((item) => (
                        <SortableTableRow
                          key={item.objId}
                          id={item.objId}
                          item={item}
                          level={item.level}
                          handleEdit={handleEdit}
                          handleViewDetail={handleViewDetail}
                          handleCopyObject={handleCopyObject}
                          openDeleteModal={openDeleteModal}
                          toggleExpand={toggleExpand}
                          isExpanded={expandedItems.includes(item.objId)}
                          hasChildren={item.hasChildren}
                          activeId={activeId}
                          overId={overId}
                          canDetail={canDetail}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          canCopy={canCopy}
                        />
                      ))}
                    </CTableBody>
                  </CTable>
                </SortableContext>
                <DragOverlay dropAnimation={defaultDropAnimation}>
                  {activeId ? (
                    <CTable
                      style={{
                        backgroundColor: 'white',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                        opacity: 0.9,
                        width: '100%',
                      }}
                    >
                      <CTableBody>
                        <CTableRow>
                          <CTableDataCell style={{ width: '50px' }}></CTableDataCell>
                          <CTableDataCell
                            style={{
                              paddingLeft: `${5 + (flatObjects.find((i) => i.objId === activeId)?.level * 5 || 0)}px`,
                              minWidth: '200px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {(flatObjects.find((i) => i.objId === activeId)?.level || 0) > 0 && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: '8px',
                                  }}
                                >
                                  {Array.from({
                                    length:
                                      flatObjects.find((i) => i.objId === activeId)?.level || 0,
                                  }).map((_, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        position: 'relative',
                                      }}
                                    >
                                      {i ===
                                        (flatObjects.find((i) => i.objId === activeId)?.level ||
                                          0) -
                                          1 && (
                                        <>
                                          <div
                                            style={{
                                              position: 'absolute',
                                              left: '8px',
                                              top: '0',
                                              bottom: '0',
                                              width: '2px',
                                              backgroundColor: '#dee2e6',
                                            }}
                                          />
                                          <div
                                            style={{
                                              position: 'absolute',
                                              left: '8px',
                                              top: '50%',
                                              width: '8px',
                                              height: '2px',
                                              backgroundColor: '#dee2e6',
                                            }}
                                          />
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <span style={{ whiteSpace: 'nowrap' }}>
                                {flatObjects.find((i) => i.objId === activeId)?.objectName}
                              </span>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            {flatObjects.find((i) => i.objId === activeId)?.accessName}
                          </CTableDataCell>
                          <CTableDataCell>
                            {flatObjects.find((i) => i.objId === activeId)?.componentName || '-'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge
                              color={
                                flatObjects.find((i) => i.objId === activeId)?.isMenu === 'Y'
                                  ? 'primary'
                                  : 'secondary'
                              }
                            >
                              {flatObjects.find((i) => i.objId === activeId)?.isMenu === 'Y'
                                ? 'Yes'
                                : 'No'}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge
                              color={
                                flatObjects.find((i) => i.objId === activeId)?.status === 'Y'
                                  ? 'success'
                                  : 'danger'
                              }
                            >
                              {flatObjects.find((i) => i.objId === activeId)?.status === 'Y'
                                ? 'Active'
                                : 'Inactive'}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {formatDateWithTime(
                              flatObjects.find((i) => i.objId === activeId)?.createdDate,
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            {flatObjects.find((i) => i.objId === activeId)?.createdBy}
                          </CTableDataCell>
                          <CTableDataCell></CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModal} onClose={closeDeleteModal}>
        <CModalHeader closeButton>
          <h5>Confirm Delete</h5>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete <strong>{selectedObject?.objectName}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeDeleteModal}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Create Object Modal */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <CModalHeader closeButton>
          <h5>Create Object</h5>
        </CModalHeader>
        <CModalBody>
          <ObjectCreate onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
        </CModalBody>
      </CModal>

      {/* Edit Object Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
        <CModalHeader closeButton>
          <h5>Edit Object</h5>
        </CModalHeader>
        <CModalBody>
          {selectedObject && (
            <ObjectEdit
              objId={selectedObject.objId}
              onClose={() => setShowEditModal(false)}
              onSuccess={handleEditSuccess}
            />
          )}
        </CModalBody>
      </CModal>

      {/* Object Detail Modal */}
      <CModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
        <CModalHeader closeButton>
          <h5>Object Detail</h5>
        </CModalHeader>
        <CModalBody>
          {selectedObject && (
            <ObjectDetail objId={selectedObject.objId} onClose={() => setShowDetailModal(false)} />
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}

export default ObjectList
