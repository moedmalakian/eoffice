import React, { useEffect, useState } from 'react'
import {
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CAlert,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CTooltip,
  CRow,
  CCol,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilClock, cilLocationPin, cilSearch } from '@coreui/icons'
import { fetchAttendances, clockIn, clockOut } from '../../services/attendanceService'
import Pagination from '../../components/Pagination'
import { useToast } from '../../utils/toastUtils'
import { formatDate, formatTime, formatDateWithTime } from '../../utils/formatDateUtils'
import SimpleMapComponent from '../../components/SimpleMapComponent'
import useGeolocation from '../../utils/useGeolocation'
import { fetchReferenceList } from '../../services/referenceService'

const DailyAttendance = () => {
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clockInModal, setClockInModal] = useState(false)
  const [clockOutModal, setClockOutModal] = useState(false)
  const [viewDetailsModal, setViewDetailsModal] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [limit, setLimit] = useState(31)
  const [formData, setFormData] = useState({
    attendance: '',
    attType: '',
    remarks: '',
    activity: '',
  })
  const { showSuccessToast, showErrorToast } = useToast()
  const { location, error: locationError, getLocation } = useGeolocation()
  const [userDetail, setUserDetail] = useState(null)
  const [hasClockedInToday, setHasClockedInToday] = useState(false)
  const [hasClockedOutToday, setHasClockedOutToday] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState(null)

  // Load Reference: Via & Type
  const [viaOptions, setViaOptions] = useState([])
  const [typeOptions, setTypeOptions] = useState([])

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const response = await fetchReferenceList(['ATTENDANCEVIA', 'ATTENDANCETYPE'])
        if (response.success && response.data) {
          setViaOptions(response.data.ATTENDANCEVIA?.details || [])
          setTypeOptions(response.data.ATTENDANCETYPE?.details || [])
        }
      } catch (err) {
        console.error('Error fetching reference list:', err)
        setViaOptions([])
        setTypeOptions([])
      }
    }
    loadReferences()
  }, [])

  // Load user detail
  useEffect(() => {
    const savedUser = localStorage.getItem('userDetail')
    if (savedUser) {
      setUserDetail(JSON.parse(savedUser))
    }
  }, [])

  const loadAttendances = async () => {
    try {
      setLoading(true)
      const params = {}
      if (currentPage !== 1) params.page = currentPage
      if (limit !== 31) params.limit = limit

      const result = await fetchAttendances(params)

      if (result.success) {
        setAttendances(result.data)
        setTotalItems(result.totalData)
        setError(null)

        checkTodayAttendanceStatus(result.data)
      } else {
        setError(result.message || 'Invalid data format from API')
      }
    } catch (err) {
      console.error('Error fetching attendances:', err)
      setError(err.response?.data?.message || 'Failed to fetch attendances')
    } finally {
      setLoading(false)
    }
  }

  // Function to check today's attendance status
  const checkTodayAttendanceStatus = (attendances) => {
    const today = new Date().toDateString()
    let hasClockedIn = false
    let hasClockedOut = false
    let todayAtt = null

    attendances.forEach((att) => {
      if (!att.startDate) return

      try {
        const attDate = new Date(att.startDate).toDateString()
        if (today === attDate) {
          todayAtt = att
          if (isValidEndDate(att.endDate)) {
            hasClockedOut = true
            hasClockedIn = true
          } else {
            hasClockedIn = true
          }
        }
      } catch (error) {
        console.error('Error checking attendance date:', error)
      }
    })

    setHasClockedInToday(hasClockedIn)
    setHasClockedOutToday(hasClockedOut)
    setTodayAttendance(todayAtt)
  }

  useEffect(() => {
    loadAttendances()
  }, [currentPage, limit])

  const handleClockIn = async () => {
    try {
      if (hasClockedInToday) {
        showErrorToast('Anda sudah melakukan clock in hari ini')
        return
      }

      if (hasClockedOutToday) {
        showErrorToast('Anda sudah melakukan clock out hari ini')
        return
      }

      if (locationError) {
        showErrorToast('Please enable location services')
        return
      }

      if (!location) {
        await getLocation()
        return
      }

      const clockInData = {
        ...formData,
        location: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        useId: userDetail?.useId,
        empId: userDetail?.empId,
        posId: userDetail?.posId,
        divId: userDetail?.divId,
      }

      const result = await clockIn(clockInData)
      if (result.success) {
        showSuccessToast('Clock in successful')
        setClockInModal(false)
        setFormData({
          attendance: '',
          attType: '',
          remarks: '',
          activity: '',
        })
        loadAttendances()
      }
    } catch (err) {
      console.error('Error clocking in:', err)
      if (err.response?.data?.message) {
        showErrorToast(err.response.data.message)
      } else if (err.message) {
        showErrorToast(err.message)
      } else {
        showErrorToast('Failed to clock in')
      }
    }
  }

  const handleClockOut = async (attId) => {
    try {
      // Frontend validation
      if (hasClockedOutToday) {
        showErrorToast('Anda sudah melakukan clock out hari ini')
        return
      }

      if (!hasClockedInToday) {
        showErrorToast('Anda belum melakukan clock in hari ini')
        return
      }

      if (locationError) {
        showErrorToast('Please enable location services')
        return
      }

      if (!location) {
        await getLocation()
        return
      }

      const result = await clockOut(attId, {
        location: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        remarks: formData.remarks,
        activity: formData.activity,
        att_type: formData.attType,
      })

      if (result.success) {
        showSuccessToast('Clock out successful')
        setClockOutModal(false)
        setFormData({
          attendance: '',
          attType: '',
          remarks: '',
          activity: '',
        })
        loadAttendances()
      }
    } catch (err) {
      console.error('Error clocking out:', err)
      if (err.response?.data?.message) {
        showErrorToast(err.response.data.message)
      } else if (err.message) {
        showErrorToast(err.message)
      } else {
        showErrorToast('Failed to clock out')
      }
    }
  }

  const openClockInModal = () => {
    if (hasClockedInToday) {
      showErrorToast('Anda sudah melakukan clock in hari ini')
      return
    }

    if (hasClockedOutToday) {
      showErrorToast('Anda sudah melakukan clock out hari ini')
      return
    }

    setClockInModal(true)
    getLocation()
  }

  const openClockOutModal = (attendance) => {
    if (hasClockedOutToday) {
      showErrorToast('Anda sudah melakukan clock out hari ini')
      return
    }

    if (!hasClockedInToday) {
      showErrorToast('Anda belum melakukan clock in hari ini')
      return
    }

    setSelectedAttendance(attendance)
    setClockOutModal(true)
    getLocation()
  }

  const openViewDetailsModal = (attendance) => {
    setSelectedAttendance(attendance)
    setViewDetailsModal(true)
  }

  const closeModal = () => {
    setClockInModal(false)
    setClockOutModal(false)
    setViewDetailsModal(false)
    setSelectedAttendance(null)
    setFormData({
      attendance: '',
      attType: '',
      remarks: '',
      activity: '',
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePageChange = (page) => setCurrentPage(page)
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setCurrentPage(1)
  }

  // Check if endDate is valid (not null, not "Invalid date")
  const isValidEndDate = (endDate) => {
    return endDate && endDate !== 'Invalid date' && endDate !== 'null' && endDate !== null
  }

  // Safe date formatting functions
  const safeFormatDate = (dateString) => {
    if (!dateString || dateString === 'Invalid Date' || dateString === 'Invalid date') return '-'
    try {
      return formatDate(dateString)
    } catch (error) {
      console.error('Error formatting date:', error)
      return '-'
    }
  }

  const safeFormatTime = (dateString) => {
    if (!dateString || dateString === 'Invalid Date' || dateString === 'Invalid date') return '-'
    try {
      return formatTime(dateString)
    } catch (error) {
      console.error('Error formatting time:', error)
      return '-'
    }
  }

  const safeFormatDateWithTime = (dateString) => {
    if (!dateString || dateString === 'Invalid Date' || dateString === 'Invalid date') return '-'
    try {
      return formatDateWithTime(dateString)
    } catch (error) {
      console.error('Error formatting date with time:', error)
      return '-'
    }
  }

  // Helper function untuk memotong teks location
  const truncateLocation = (location, maxLength = 50) => {
    if (!location) return '-'
    if (location.length <= maxLength) return location
    return location.substring(0, maxLength) + '...'
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Daily Attendance</h4>
        <div>
          <CButton
            color="primary"
            onClick={openClockInModal}
            className="me-2"
            disabled={hasClockedInToday || hasClockedOutToday}
          >
            <CIcon icon={cilClock} className="me-2" />
            Clock In
          </CButton>

          <CButton
            color="danger"
            onClick={() => {
              if (todayAttendance) {
                openClockOutModal(todayAttendance)
              } else {
                showErrorToast('Tidak ada attendance aktif untuk hari ini')
              }
            }}
            disabled={hasClockedOutToday || !hasClockedInToday}
          >
            <CIcon icon={cilClock} className="me-2" />
            Clock Out
          </CButton>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading attendances...</p>
        </div>
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Clock In</CTableHeaderCell>
                <CTableHeaderCell>Clock Out</CTableHeaderCell>
                <CTableHeaderCell>Attendance</CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Location</CTableHeaderCell>
                <CTableHeaderCell>Activity</CTableHeaderCell>
                <CTableHeaderCell>Hours</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
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
                    <CTableDataCell>{attendance.attendance || '-'}</CTableDataCell>
                    <CTableDataCell>{attendance.attType || '-'}</CTableDataCell>
                    <CTableDataCell>
                      <CTooltip content={attendance.location || '-'} placement="top">
                        <span>
                          <CIcon icon={cilLocationPin} className="me-1" />
                          {attendance.location
                            ? truncateLocation(attendance.location.split(',')[0])
                            : '-'}
                        </span>
                      </CTooltip>
                    </CTableDataCell>
                    <CTableDataCell>{attendance.activity || '-'}</CTableDataCell>
                    <CTableDataCell>{attendance.hours || '-'}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={isValidEndDate(attendance.endDate) ? 'success' : 'warning'}>
                        {isValidEndDate(attendance.endDate) ? 'Completed' : 'In Progress'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CTooltip content="View Details" placement="top">
                        <CButton
                          color="info"
                          size="sm"
                          variant="outline"
                          onClick={() => openViewDetailsModal(attendance)}
                        >
                          <CIcon icon={cilSearch} />
                        </CButton>
                      </CTooltip>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="11" className="text-center">
                    No attendance records found.
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

      {/* Clock In Modal */}
      <CModal visible={clockInModal} onClose={closeModal}>
        <CModalHeader onClose={closeModal}>
          <h5 className="modal-title">Clock In</h5>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {locationError && (
              <CAlert color="danger" className="mb-3">
                Location error: {locationError}. Please enable location services.
              </CAlert>
            )}

            {/* Row 1: Datetime & Attendance */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Datetime</CFormLabel>
                <CFormInput type="text" value={formatDateWithTime(new Date())} disabled />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="attendance">Attendance</CFormLabel>
                <CFormSelect
                  id="attendance"
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleInputChange}
                >
                  {typeOptions.map((t) => (
                    <option key={t.rfdId} value={t.referenceKey}>
                      {t.referenceValue}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            {/* Row 2: Via & Remarks */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="attType">Via</CFormLabel>
                <CFormSelect
                  id="attType"
                  name="attType"
                  value={formData.attType}
                  onChange={handleInputChange}
                >
                  {viaOptions.map((v) => (
                    <option key={v.rfdId} value={v.referenceKey}>
                      {v.referenceValue}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="remarks">Remarks</CFormLabel>
                <CFormInput
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Enter remarks"
                  required
                />
              </CCol>
            </CRow>

            {/* Row 3: Location */}
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel>Location</CFormLabel>
                <CFormTextarea
                  rows={3}
                  value={location ? location.address : 'Getting location...'}
                  disabled
                />
              </CCol>
            </CRow>

            {/* Row 4: Map */}
            <CRow className="mb-3">
              <CCol md={12}>
                <SimpleMapComponent
                  latitude={location?.latitude}
                  longitude={location?.longitude}
                  height="250px"
                  zoomLevel={20}
                />
              </CCol>
            </CRow>

            {/* Row 5: Activity */}
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="activity">Activity</CFormLabel>
                <CFormTextarea
                  id="activity"
                  name="activity"
                  value={formData.activity}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter activity"
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleClockIn} disabled={!location}>
            Clock In
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Clock Out Modal */}
      <CModal visible={clockOutModal} onClose={closeModal}>
        <CModalHeader onClose={closeModal}>
          <h5 className="modal-title">Clock Out</h5>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {locationError && (
              <CAlert color="danger" className="mb-3">
                Location error: {locationError}. Please enable location services.
              </CAlert>
            )}

            {/* Row 1: Datetime & Attendance */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Datetime</CFormLabel>
                <CFormInput type="text" value={formatDateWithTime(new Date())} disabled />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Attendance</CFormLabel>
                <CFormInput type="text" value={selectedAttendance?.attendance || '-'} disabled />
              </CCol>
            </CRow>

            {/* Row 2: Via & Remarks */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="attType">Via</CFormLabel>
                <CFormSelect
                  id="attType"
                  name="attType"
                  value={formData.attType}
                  onChange={handleInputChange}
                  required
                >
                  {viaOptions.map((v) => (
                    <option key={v.rfdId} value={v.referenceKey}>
                      {v.referenceValue}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="remarks">Remarks</CFormLabel>
                <CFormInput
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Enter remarks"
                />
              </CCol>
            </CRow>

            {/* Row 3: Location */}
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel>Location</CFormLabel>
                <CFormTextarea
                  rows={3}
                  value={location ? location.address : 'Getting location...'}
                  disabled
                />
              </CCol>
            </CRow>

            {/* Row 4: Map */}
            <CRow className="mb-3">
              <CCol md={12}>
                <SimpleMapComponent
                  latitude={parseFloat(location?.latitude)}
                  longitude={parseFloat(location?.longitude)}
                  height="250px"
                  zoomLevel={20}
                />
              </CCol>
            </CRow>

            {/* Row 5: Activity */}
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="activity">Activity*</CFormLabel>
                <CFormTextarea
                  id="activity"
                  name="activity"
                  value={formData.activity}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter activity"
                  required
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={() => handleClockOut(selectedAttendance?.attId || selectedAttendance?.att_id)}
            disabled={!location}
          >
            Clock Out
          </CButton>
        </CModalFooter>
      </CModal>

      {/* View Details Modal */}
      <CModal visible={viewDetailsModal} onClose={closeModal}>
        <CModalHeader onClose={closeModal}>
          <h5 className="modal-title">Attendance Details</h5>
        </CModalHeader>
        <CModalBody>
          {selectedAttendance && (
            <CForm>
              {/* Row 1: Datetime & Attendance */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Clock In</CFormLabel>
                  <CFormInput
                    type="text"
                    value={safeFormatDateWithTime(selectedAttendance.startDate)}
                    disabled
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Clock Out</CFormLabel>
                  <CFormInput type="text" value={selectedAttendance.endDate || '-'} disabled />
                </CCol>
              </CRow>

              {/* Row 2: Via & Remarks */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Attendance</CFormLabel>
                  <CFormInput type="text" value={selectedAttendance.attendance || '-'} disabled />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Via</CFormLabel>
                  <CFormInput type="text" value={selectedAttendance.attType || '-'} disabled />
                </CCol>
              </CRow>

              {/* Row 3: Location */}
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Location</CFormLabel>
                  <CFormTextarea rows={3} value={selectedAttendance.location || '-'} disabled />
                </CCol>
              </CRow>

              {/* Row 4: Map */}
              <CRow className="mb-3">
                <CCol md={12}>
                  {selectedAttendance.latitude && selectedAttendance.longitude && (
                    <SimpleMapComponent
                      latitude={parseFloat(selectedAttendance.latitude)}
                      longitude={parseFloat(selectedAttendance.longitude)}
                      height="250px"
                      zoomLevel={20}
                    />
                  )}
                </CCol>
              </CRow>

              {/* Row 5: Remarks */}
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Remarks</CFormLabel>
                  <CFormTextarea rows={1} value={selectedAttendance.remarks || '-'} disabled />
                </CCol>
              </CRow>

              {/* Row 5: Activity */}
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Activity</CFormLabel>
                  <CFormTextarea rows={3} value={selectedAttendance.activity || '-'} disabled />
                </CCol>
              </CRow>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default DailyAttendance
