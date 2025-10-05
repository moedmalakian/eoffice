import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUsers, deleteUser } from '../../../services/userService'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'

import Pagination from '../../../components/Pagination'
import Search from '../../../components/Search'
import useDebounce from '../../../utils/useDebounce'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { showSuccessDeleteToast, showErrorDeleteToast } = useToast()
  const navigate = useNavigate()
  const focusRef = useRef(null)

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDetail, setCanDetail] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('UserCreate'))
    setCanEdit(hasAccessSync('UserEdit'))
    setCanDetail(hasAccessSync('UserDetail'))
    setCanDelete(hasAccessSync('UserDelete'))
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)

      const params = { page: currentPage, limit, search: debouncedSearchTerm.trim() }
      const response = await fetchUsers(params)

      if (response.success) {
        setUsers(response.data)
        setTotalItems(response.totalData)
        setError(null)
      } else {
        setError('Invalid data format from API')
      }
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [currentPage, limit, debouncedSearchTerm])

  const handleCreate = () => {
    const url = getObjectLink('UserCreate')
    if (!url) {
      console.warn('[UserList] Link for UserCreate not found or has unresolved params.')
      return
    }
    navigate(url)
  }

  const handleDetail = (useId) => {
    const url = getObjectLink('UserDetail', { useId })
    if (!url) {
      console.warn('[UserList] Link for UserDetail not found or has unresolved params.', {
        useId,
      })
      return
    }
    navigate(url)
  }

  const handleEdit = (useId) => {
    const url = getObjectLink('UserEdit', { useId })
    if (!url) {
      console.warn('[UserList] Link for UserEdit not found or has unresolved params.', {
        useId,
      })
      return
    }
    navigate(url)
  }

  const handleDelete = async () => {
    try {
      if (selectedUser) {
        await deleteUser(selectedUser.useId)
        showSuccessDeleteToast()
        setUsers(users.filter((user) => user.useId !== selectedUser.useId))
        setDeleteModal(false)
        setSelectedUser(null)
      }
    } catch (err) {
      console.error('Failed to delete user:', err)
      showErrorDeleteToast()
    }
  }

  const openModal = (user) => {
    setSelectedUser(user)
    setDeleteModal(true)
  }

  const closeModal = () => {
    setSelectedUser(null)
    setDeleteModal(false)
    if (focusRef.current) {
      focusRef.current.focus()
    }
  }

  const handlePageChange = (page) => setCurrentPage(page)
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setCurrentPage(1)
  }

  const handleSearch = (keyword) => {
    setSearchTerm(keyword)
    setCurrentPage(1)
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Master Data - User</h4>

        {accessReady && canCreate && (
          <CButton color="primary" onClick={handleCreate} ref={focusRef}>
            Create User
          </CButton>
        )}
      </div>

      <Search onSearch={handleSearch} placeholder="Search user" buttonColor="info" />

      {loading && (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading users...</p>
        </div>
      )}

      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>No.</CTableHeaderCell>
                <CTableHeaderCell>Username</CTableHeaderCell>
                <CTableHeaderCell>Full Name</CTableHeaderCell>
                <CTableHeaderCell>User</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Created Date</CTableHeaderCell>
                <CTableHeaderCell>Created By</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((data, index) => (
                <CTableRow key={data.useId || index}>
                  <CTableDataCell>{(currentPage - 1) * limit + index + 1}</CTableDataCell>
                  <CTableDataCell>{data.username}</CTableDataCell>
                  <CTableDataCell>{data.fullName}</CTableDataCell>
                  <CTableDataCell>{data.divisionName}</CTableDataCell>
                  <CTableDataCell>{data.roleName}</CTableDataCell>
                  <CTableDataCell>{formatDateWithTime(data.createdDate)}</CTableDataCell>
                  <CTableDataCell>{data.createdBy}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={data.status === 'Y' ? 'success' : 'danger'}>
                      {data.status === 'Y' ? 'Active' : 'Not Active'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {accessReady && canDetail && (
                      <CTooltip content="View Data" placement="top" trigger="hover" delay={0}>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2"
                          variant="outline"
                          onClick={() => handleDetail(data.useId)}
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
                          className="me-2"
                          variant="outline"
                          onClick={() => handleEdit(data.useId)}
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
                          onClick={() => openModal(data)}
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

      <CModal visible={deleteModal} onClose={closeModal}>
        <CModalHeader closeButton>Confirm Delete</CModalHeader>
        <CModalBody>
          Are you sure you want to delete user <strong>{selectedUser?.username}</strong>?
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
    </div>
  )
}

export default UserList
