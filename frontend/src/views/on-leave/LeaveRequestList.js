import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchLeaveRequests, deleteLeaveRequest } from '../../services/onLeaveService'
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
import { cilPencil, cilTrash, cilSearch, cilSend } from '@coreui/icons'
import Pagination from '../../components/Pagination'
import Search from '../../components/Search'
import useDebounce from '../../utils/useDebounce'
import { formatDate } from '../../utils/formatDateUtils'
import { useToast } from '../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../utils/permissionUtils'

const LeaveRequestList = () => {
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { showSuccessDeleteToast, showErrorDeleteToast } = useToast()
  const navigate = useNavigate()
  const focusRef = useRef(null)

  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDetail, setCanDetail] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('LeaveRequestCreate'))
    setCanEdit(hasAccessSync('LeaveRequestEdit'))
    setCanDetail(hasAccessSync('LeaveRequestDetail'))
    setCanDelete(hasAccessSync('LeaveRequestDelete'))
  }, [])

  const loadLeaveRequests = async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, limit, search: debouncedSearchTerm.trim() }
      const result = await fetchLeaveRequests(params)
      if (result.success) {
        setLeaveRequests(result.data)
        setTotalItems(result.totalData)
        setError(null)
      } else {
        setError('Invalid data format from API')
      }
    } catch (err) {
      console.error('Error fetching leave requests:', err)
      setError('Failed to fetch leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaveRequests()
  }, [currentPage, limit, debouncedSearchTerm])

  const handleCreate = () => {
    const url = getObjectLink('LeaveRequestCreate')
    if (url) navigate(url)
  }

  const handleDetail = (onlId) => {
    const url = getObjectLink('LeaveRequestDetail', { onlId })
    if (url) navigate(url)
  }

  const handleEdit = (onlId) => {
    const url = getObjectLink('LeaveRequestEdit', { onlId })
    if (url) navigate(url)
  }

  const handleDelete = async () => {
    if (!selectedLeave?.onlId) return
    try {
      await deleteLeaveRequest(selectedLeave.onlId)
      showSuccessDeleteToast()
      loadLeaveRequests()
      closeModal()
    } catch (err) {
      console.error('Failed to delete leave request:', err)
      showErrorDeleteToast()
    }
  }

  const openModal = (leave) => {
    setSelectedLeave(leave)
    setDeleteModal(true)
  }

  const closeModal = () => {
    setSelectedLeave(null)
    setDeleteModal(false)
    if (focusRef.current) focusRef.current.focus()
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Leave Requests</h4>
        {accessReady && canCreate && (
          <CButton color="primary" onClick={handleCreate} ref={focusRef}>
            Create Leave
          </CButton>
        )}
      </div>

      <Search onSearch={setSearchTerm} placeholder="Search leave requests" buttonColor="info" />

      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>No.</CTableHeaderCell>
                <CTableHeaderCell>Leave Type</CTableHeaderCell>
                <CTableHeaderCell>Start Date</CTableHeaderCell>
                <CTableHeaderCell>End Date</CTableHeaderCell>
                <CTableHeaderCell>Qty</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Created By</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {leaveRequests.length > 0 ? (
                leaveRequests.map((data, index) => (
                  <CTableRow key={data.onlId}>
                    <CTableDataCell>{(currentPage - 1) * limit + index + 1}</CTableDataCell>
                    <CTableDataCell>{data.onlType}</CTableDataCell>
                    <CTableDataCell>{formatDate(data.startDate)}</CTableDataCell>
                    <CTableDataCell>{formatDate(data.endDate)}</CTableDataCell>
                    <CTableDataCell>{data.qty}</CTableDataCell>
                    <CTableDataCell>{data.status}</CTableDataCell>
                    <CTableDataCell>{data.createdBy}</CTableDataCell>
                    <CTableDataCell>
                      <CTooltip content="Send Data">
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          className="me-2"
                          //onClick={() => handleDetail(data.onlId)}
                        >
                          <CIcon icon={cilSend} />
                        </CButton>
                      </CTooltip>
                      {accessReady && canDetail && (
                        <CTooltip content="View Data">
                          <CButton
                            size="sm"
                            color="info"
                            variant="outline"
                            className="me-2"
                            onClick={() => handleDetail(data.onlId)}
                          >
                            <CIcon icon={cilSearch} />
                          </CButton>
                        </CTooltip>
                      )}
                      {accessReady && canEdit && (
                        <CTooltip content="Edit Data">
                          <CButton
                            size="sm"
                            color="warning"
                            variant="outline"
                            className="me-2"
                            onClick={() => handleEdit(data.onlId)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                        </CTooltip>
                      )}
                      {accessReady && canDelete && (
                        <CTooltip content="Delete Data">
                          <CButton
                            size="sm"
                            color="danger"
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
                  <CTableDataCell colSpan="7" className="text-center">
                    No leaves found.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / limit)}
            onPageChange={setCurrentPage}
            limit={limit}
            onLimitChange={setLimit}
            totalEntries={totalItems}
          />
        </>
      )}

      <CModal visible={deleteModal} onClose={closeModal}>
        <CModalHeader onClose={closeModal}>Confirm Delete</CModalHeader>
        <CModalBody>Are you sure you want to delete this leave request?</CModalBody>
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

export default LeaveRequestList
