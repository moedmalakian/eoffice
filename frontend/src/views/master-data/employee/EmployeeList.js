import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEmployees, deleteEmployee } from '../../../services/employeeService'
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'
import Pagination from '../../../components/Pagination'
import Search from '../../../components/Search'
import useDebounce from '../../../utils/useDebounce'
import { formatDate } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const EmployeeList = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDetail, setCanDetail] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { showSuccessDeleteToast, showErrorDeleteToast } = useToast()
  const navigate = useNavigate()
  const focusRef = useRef(null)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('EmployeeCreate'))
    setCanEdit(hasAccessSync('EmployeeEdit'))
    setCanDetail(hasAccessSync('EmployeeDetail'))
    setCanDelete(hasAccessSync('EmployeeDelete'))
  }, [])

  const loadEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: currentPage, limit, search: debouncedSearchTerm.trim() }
      const result = await fetchEmployees(params)
      if (result?.success) {
        setEmployees(result.data || [])
        setTotalData(result.totalData || 0)
      } else if (Array.isArray(result)) {
        setEmployees(result)
        setTotalData(result.length)
      } else if (result?.data && Array.isArray(result.data)) {
        setEmployees(result.data)
        setTotalData(result.totalData || result.data.length)
      } else {
        setEmployees([])
        setTotalData(0)
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError('An error occurred while fetching employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [currentPage, limit, debouncedSearchTerm])

  const handleCreate = () => {
    const url = getObjectLink('EmployeeCreate')
    if (!url) {
      console.warn('[EmployeeList] Link for EmployeeCreate not found or has unresolved params.')
      return
    }
    navigate(url)
  }

  const handleDetail = (empId) => {
    const url = getObjectLink('EmployeeDetail', { empId })
    if (!url) {
      console.warn('[EmployeeList] Link for EmployeeDetail not found or has unresolved params.', {
        empId,
      })
      return
    }
    navigate(url)
  }

  const handleEdit = (empId) => {
    const url = getObjectLink('EmployeeEdit', { empId })
    if (!url) {
      console.warn('[EmployeeList] Link for EmployeeEdit not found or has unresolved params.', {
        empId,
      })
      return
    }
    navigate(url)
  }

  const handleDelete = async () => {
    if (!selectedEmployee?.empId) return
    try {
      await deleteEmployee(selectedEmployee.empId)
      showSuccessDeleteToast()
      loadEmployees()
      closeModal()
    } catch (err) {
      console.error('Failed to delete employee:', err)
      showErrorDeleteToast()
    }
  }

  const openModal = (employee) => {
    setSelectedEmployee(employee)
    setDeleteModal(true)
  }

  const closeModal = () => {
    setDeleteModal(false)
    setSelectedEmployee(null)
    if (focusRef.current) focusRef.current.focus()
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
        <h4>Master Data - Employee</h4>

        {accessReady && canCreate && (
          <CButton color="primary" onClick={handleCreate} ref={focusRef}>
            Create Employee
          </CButton>
        )}
      </div>

      <Search onSearch={handleSearch} placeholder="Search employee" buttonColor="info" />

      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading employees...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>No.</CTableHeaderCell>
                <CTableHeaderCell>Full Name</CTableHeaderCell>
                <CTableHeaderCell>Gender</CTableHeaderCell>
                <CTableHeaderCell>Birthday</CTableHeaderCell>
                <CTableHeaderCell>Division</CTableHeaderCell>
                <CTableHeaderCell>Position</CTableHeaderCell>
                <CTableHeaderCell>Phone</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {employees.length > 0 ? (
                employees.map((data, index) => (
                  <CTableRow key={data.empId || index}>
                    <CTableDataCell>{(currentPage - 1) * limit + index + 1}</CTableDataCell>
                    <CTableDataCell>{data.fullName}</CTableDataCell>
                    <CTableDataCell>{data.gender}</CTableDataCell>
                    <CTableDataCell>{formatDate(data.birthday)}</CTableDataCell>
                    <CTableDataCell>{data.divisionName}</CTableDataCell>
                    <CTableDataCell>{data.positionName}</CTableDataCell>
                    <CTableDataCell>{data.phone}</CTableDataCell>
                    <CTableDataCell>{data.email}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={data.status === 'Y' ? 'success' : 'danger'}>
                        {data.status === 'Y' ? 'Active' : 'Not Active'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {accessReady && canDetail && (
                        <CTooltip content="View Data" placement="top">
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            variant="outline"
                            onClick={() => handleDetail(data.empId)}
                          >
                            <CIcon icon={cilSearch} />
                          </CButton>
                        </CTooltip>
                      )}

                      {accessReady && canEdit && (
                        <CTooltip content="Edit Data" placement="top">
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            variant="outline"
                            onClick={() => handleEdit(data.empId)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                        </CTooltip>
                      )}

                      {accessReady && canDelete && (
                        <CTooltip content="Delete Data" placement="top">
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
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="10" className="text-center">
                    No employees found.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalData / limit)}
            onPageChange={handlePageChange}
            limit={limit}
            onLimitChange={handleLimitChange}
            totalEntries={totalData}
          />
        </>
      )}

      <CModal visible={deleteModal} onClose={closeModal}>
        <CModalHeader onClose={closeModal}>Confirm Delete</CModalHeader>
        <CModalBody>
          Are you sure you want to delete employee <strong>{selectedEmployee?.fullName}</strong>?
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

export default EmployeeList
