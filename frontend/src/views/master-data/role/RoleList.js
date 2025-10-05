import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRoles, deleteRole } from '../../../services/roleService'
import { fetchObjects } from '../../../services/roleObjectService'
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
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch, cilScrubber } from '@coreui/icons'
import RoleAccess from './RoleAccess'
import Pagination from '../../../components/Pagination'
import Search from '../../../components/Search'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import useDebounce from '../../../utils/useDebounce'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const RoleList = () => {
  const navigate = useNavigate()
  const focusRef = useRef(null)
  const { showSuccessDeleteToast, showErrorDeleteToast } = useToast()

  const [roles, setRoles] = useState([])
  const [objects, setObjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [showRoleAccessModal, setShowRoleAccessModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDetail, setCanDetail] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [canAccess, setCanAccess] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('RoleCreate'))
    setCanEdit(hasAccessSync('RoleEdit'))
    setCanDetail(hasAccessSync('RoleDetail'))
    setCanDelete(hasAccessSync('RoleDelete'))
    setCanAccess(hasAccessSync('RoleAccess'))
  }, [])

  useEffect(() => {
    loadRoles(debouncedSearchTerm)
  }, [currentPage, limit, debouncedSearchTerm])

  const loadRoles = async (searchTerm) => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit,
        search: searchTerm.trim(),
      }
      const response = await fetchRoles(params)

      if (response?.data && Array.isArray(response.data)) {
        setRoles(response.data)
        setTotalItems(response.totalData || 0)
      } else {
        setError('Invalid data format from API')
        console.error('Expected array but got:', response.data)
      }
    } catch (err) {
      console.error('Error fetching roles:', err)
      setError('Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  const loadObjects = async () => {
    try {
      const response = await fetchObjects()
      if (response?.data && Array.isArray(response.data)) {
        setObjects(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch objects for RoleAccess:', err)
    }
  }

  const handleCreate = () => {
    const url = getObjectLink('RoleCreate')
    if (!url) {
      console.warn('[RoleList] Link for RoleCreate not found or has unresolved params.')
      return
    }
    navigate(url)
  }

  const handleDetail = (rolId) => {
    const url = getObjectLink('RoleDetail', { rolId })
    if (!url) {
      console.warn('[RoleList] Link for RoleDetail not found or has unresolved params.', {
        rolId,
      })
      return
    }
    navigate(url)
  }

  const handleEdit = (rolId) => {
    const url = getObjectLink('RoleEdit', { rolId })
    if (!url) {
      console.warn('[RoleList] Link for RoleEdit not found or has unresolved params.', {
        rolId,
      })
      return
    }
    navigate(url)
  }

  const handleAccessMenu = async (rolId) => {
    setSelectedRole({ rolId })
    setShowRoleAccessModal(true)
  }

  const handleDelete = async () => {
    try {
      if (selectedRole?.rolId) {
        await deleteRole(selectedRole.rolId)
        showSuccessDeleteToast()
        setRoles((prev) => prev.filter((role) => role.rolId !== selectedRole.rolId))
        closeModal()
      }
    } catch (err) {
      console.error('Failed to delete role:', err)
      showErrorDeleteToast()
    }
  }

  const openModal = useCallback((role) => {
    setSelectedRole(role)
    setDeleteModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedRole(null)
    setDeleteModal(false)
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit)
    setCurrentPage(1)
  }, [])

  const handleSearch = (keyword) => {
    setSearchTerm(keyword)
    setCurrentPage(1)
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Master Data - Role</h4>

        {accessReady && canCreate && (
          <CButton color="primary" onClick={handleCreate} ref={focusRef}>
            Create Role
          </CButton>
        )}
      </div>

      <Search onSearch={handleSearch} placeholder="Search role" buttonColor="info" />

      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading roles...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : roles.length === 0 ? (
        <p className="text-center text-muted">No roles found.</p>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>No.</CTableHeaderCell>
                <CTableHeaderCell>Role Name</CTableHeaderCell>
                <CTableHeaderCell>Created Date</CTableHeaderCell>
                <CTableHeaderCell>Created By</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {roles.map((role, index) => (
                <CTableRow key={role.rolId || index}>
                  <CTableDataCell>{(currentPage - 1) * limit + index + 1}</CTableDataCell>
                  <CTableDataCell>{role.roleName}</CTableDataCell>
                  <CTableDataCell>{formatDateWithTime(role.createdDate)}</CTableDataCell>
                  <CTableDataCell>{role.createdBy}</CTableDataCell>
                  <CTableDataCell>
                    {accessReady && canAccess && (
                      <CTooltip content="Access Menu" placement="top" trigger="hover" delay={0}>
                        <CButton
                          color="primary"
                          size="sm"
                          variant="outline"
                          className="me-2"
                          onClick={() => handleAccessMenu(role.rolId)}
                        >
                          <CIcon icon={cilScrubber} />
                        </CButton>
                      </CTooltip>
                    )}

                    {accessReady && canDetail && (
                      <CTooltip content="View Data" placement="top" trigger="hover" delay={0}>
                        <CButton
                          color="info"
                          size="sm"
                          variant="outline"
                          className="me-2"
                          onClick={() => handleDetail(role.rolId)}
                        >
                          <CIcon icon={cilSearch} />
                        </CButton>
                      </CTooltip>
                    )}

                    {accessReady && canEdit && (
                      <CTooltip content="Edit Data" placement="top" trigger="hover" delay={0}>
                        <CButton
                          color="warning"
                          size="sm"
                          variant="outline"
                          className="me-2"
                          onClick={() => handleEdit(role.rolId)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTooltip>
                    )}

                    {accessReady && canDelete && (
                      <CTooltip content="Delete Data" placement="top" trigger="hover" delay={0}>
                        <CButton
                          color="danger"
                          size="sm"
                          variant="outline"
                          className="me-2"
                          onClick={() => openModal(role)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTooltip>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / limit)}
            onPageChange={handlePageChange}
            limit={limit}
            onLimitChange={handleLimitChange}
            totalEntries={totalItems}
          />
        </>
      )}

      {deleteModal && selectedRole && (
        <CModal visible={deleteModal} onClose={closeModal} portal={false}>
          <CModalHeader closeButton>Confirm Delete</CModalHeader>
          <CModalBody>
            Are you sure you want to delete role <strong>{selectedRole?.roleName}</strong>?
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={closeModal}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Delete
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {showRoleAccessModal && selectedRole && (
        <RoleAccess
          showModal={showRoleAccessModal}
          onClose={() => setShowRoleAccessModal(false)}
          rolId={selectedRole?.rolId || null}
          onSuccess={() => setShowRoleAccessModal(false)}
        />
      )}
    </div>
  )
}

export default RoleList
