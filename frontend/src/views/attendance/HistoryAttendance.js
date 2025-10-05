// src/views/attendance/HistoryAttendance.js
import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CAlert,
  CFormInput,
  CButton,
  CFormLabel,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFilter } from '@coreui/icons'
import { fetchAttendanceHistory } from '../../services/attendanceService'
import { useToast } from '../../utils/toastUtils'
import { formatDate, formatTime } from '../../utils/formatDateUtils'
import useDebounce from '../../utils/useDebounce'
import Pagination from '../../components/Pagination'

const AttendanceHistory = () => {
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    empId: '',
    divId: '',
    posId: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    empId: '',
    divId: '',
    posId: '',
  })

  const debouncedStartDate = useDebounce(filters.startDate, 500)
  const debouncedEndDate = useDebounce(filters.endDate, 500)
  const { showErrorToast } = useToast()

  const loadAttendanceHistory = async () => {
    try {
      setLoading(true)

      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const userDetail = JSON.parse(localStorage.getItem('userDetail') || '{}')

      const params = {
        page: currentPage,
        limit,
        ...(appliedFilters.startDate && { startDate: appliedFilters.startDate }),
        ...(appliedFilters.endDate && { endDate: appliedFilters.endDate }),
        ...(appliedFilters.empId && { empId: appliedFilters.empId }),
        ...(appliedFilters.divId && { divId: appliedFilters.divId }),
        ...(appliedFilters.posId && { posId: appliedFilters.posId }),
      }

      if (!params.empId) {
        // if user is an employee, filter by them by default
        if (userDetail?.empId) params.empId = userDetail.empId
        else if (userInfo?.empId) params.empId = userInfo.empId
      }

      const result = await fetchAttendanceHistory(params)

      if (result.success) {
        setAttendances(result.data)
        setTotalItems(result.totalData)
        setTotalPages(result.totalPages)
        setError(null)
      } else {
        setError(result.message || 'Invalid data format from API')
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch attendance history')
      showErrorToast('Failed to load attendance history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendanceHistory()
  }, [currentPage, limit, appliedFilters])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      showErrorToast('Start date cannot be greater than end date')
      return
    }

    setAppliedFilters({
      startDate: filters.startDate,
      endDate: filters.endDate,
      empId: filters.empId,
      divId: filters.divId,
      posId: filters.posId,
    })
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({ startDate: '', endDate: '', empId: '', divId: '', posId: '' })
    setAppliedFilters({ startDate: '', endDate: '', empId: '', divId: '', posId: '' })
    setCurrentPage(1)
  }

  const handlePageChange = (page) => setCurrentPage(page)
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setCurrentPage(1)
  }

  const isValidEndDate = (endDate) =>
    endDate && endDate !== 'Invalid date' && endDate !== 'null' && endDate !== null

  const safeFormatDate = (dateString) => {
    if (!dateString || dateString === 'Invalid Date' || dateString === 'Invalid date') return '-'
    try {
      return formatDate(dateString)
    } catch (e) {
      console.error(e)
      return '-'
    }
  }

  const safeFormatTime = (dateString) => {
    if (!dateString || dateString === 'Invalid Date' || dateString === 'Invalid date') return '-'
    try {
      return formatTime(dateString)
    } catch (e) {
      console.error(e)
      return '-'
    }
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>History Attendance</h4>
      </div>

      <div className="mb-4">
        <CRow className="g-3">
          <CCol md={2}>
            <CFormLabel htmlFor="startDate">From</CFormLabel>
            <CFormInput
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </CCol>
          <CCol md={2}>
            <CFormLabel htmlFor="endDate">To</CFormLabel>
            <CFormInput
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </CCol>
          <CCol md={1} className="d-flex align-items-end">
            <CButton color="primary" onClick={handleSearch} className="w-100" variant="outline">
              <CIcon icon={cilFilter} className="me-2" />
              Filter
            </CButton>
          </CCol>
          {/* <CCol md={1} className="d-flex align-items-end">
            <CButton
              color="secondary"
              onClick={handleClearFilters}
              className="w-100"
              variant="outline"
            >
              Clear
            </CButton>
          </CCol> */}
        </CRow>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <CSpinner color="primary" />
          <p className="mt-2">Loading attendance history...</p>
        </div>
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : (
        <>
          <CTable striped hover responsive className="mb-4">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Clock In</CTableHeaderCell>
                <CTableHeaderCell>Clock Out</CTableHeaderCell>
                <CTableHeaderCell>Hours</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Location</CTableHeaderCell>
                <CTableHeaderCell>Activity</CTableHeaderCell>
                <CTableHeaderCell>Remarks</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {attendances.length > 0 ? (
                attendances.map((attendance, index) => (
                  <CTableRow key={attendance.attId || index}>
                    <CTableDataCell>{safeFormatDate(attendance.startDate)}</CTableDataCell>
                    <CTableDataCell>{safeFormatTime(attendance.startDate)}</CTableDataCell>
                    <CTableDataCell>
                      {isValidEndDate(attendance.endDate)
                        ? safeFormatTime(attendance.endDate)
                        : '-'}
                    </CTableDataCell>
                    <CTableDataCell>{attendance.hours ? attendance.hours : '-'}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={isValidEndDate(attendance.endDate) ? 'success' : 'warning'}>
                        {isValidEndDate(attendance.endDate) ? 'Completed' : 'In Progress'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{attendance.attType || '-'}</CTableDataCell>
                    <CTableDataCell>
                      {attendance.location
                        ? attendance.location.split(',')[0].substring(0, 50)
                        : '-'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {attendance.activity ? attendance.activity.substring(0, 50) : '-'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {attendance.remarks ? attendance.remarks.substring(0, 50) : '-'}
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="9" className="text-center">
                    No records found.
                  </CTableDataCell>
                </CTableRow>
              )}
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
    </div>
  )
}

export default AttendanceHistory
