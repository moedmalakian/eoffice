import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPositions, deletePosition } from '../../../services/positionService'
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
import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'
import Pagination from '../../../components/Pagination'
import Search from '../../../components/Search'
import useDebounce from '../../../utils/useDebounce'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const PositionList = () => {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(null)
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
    setCanCreate(hasAccessSync('PositionCreate'))
    setCanEdit(hasAccessSync('PositionEdit'))
    setCanDetail(hasAccessSync('PositionDetail'))
    setCanDelete(hasAccessSync('PositionDelete'))
  }, [])

  const loadPositions = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = { page: currentPage, limit, search: debouncedSearchTerm.trim() }
      const result = await fetchPositions(params)

      if (result.success) {
        setPositions(result.data)
        setTotalItems(result.totalData)
        setError(null)
      } else {
        setError('Invalid data format from API')
      }
    } catch (err) {
      console.error('Error fetching positions:', err)
      setError('Failed to fetch positions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPositions()
  }, [currentPage, limit, debouncedSearchTerm])

  const handleCreate = () => {
    const url = getObjectLink('PositionCreate')
    if (!url) {
      console.warn('[PositionList] Link for PositionCreate not found or has unresolved params.')
      return
    }
    navigate(url)
  }

  const handleDetail = (posId) => {
    const url = getObjectLink('PositionDetail', { posId })
    if (!url) {
      console.warn('[PositionList] Link for PositionDetail not found or has unresolved params.', {
        posId,
      })
      return
    }
    navigate(url)
  }

  const handleEdit = (posId) => {
    const url = getObjectLink('PositionEdit', { posId })
    if (!url) {
      console.warn('[PositionList] Link for PositionEdit not found or has unresolved params.', {
        posId,
      })
      return
    }
    navigate(url)
  }

  const handleDelete = async () => {
    if (!selectedPosition?.posId) return
    try {
      await deletePosition(selectedPosition.posId)
      showSuccessDeleteToast()
      loadPositions()
      closeModal()
    } catch (err) {
      console.error('Failed to delete position:', err)
      showErrorDeleteToast()
    }
  }

  const openModal = (position) => {
    setSelectedPosition(position)
    setDeleteModal(true)
  }

  const closeModal = () => {
    setDeleteModal(false)
    setSelectedPosition(null)
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
        <h4>Master Data - Position</h4>

        {accessReady && canCreate && (
          <CButton color="primary" onClick={handleCreate} ref={focusRef}>
            Create Position
          </CButton>
        )}
      </div>

      <Search onSearch={handleSearch} placeholder="Search position" buttonColor="info" />

      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading positions...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>No.</CTableHeaderCell>
                <CTableHeaderCell>Position Code</CTableHeaderCell>
                <CTableHeaderCell>Position Name</CTableHeaderCell>
                <CTableHeaderCell>Created Date</CTableHeaderCell>
                <CTableHeaderCell>Created By</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {positions.map((data, index) => (
                <CTableRow key={data.posId || index}>
                  <CTableDataCell>{(currentPage - 1) * limit + index + 1}</CTableDataCell>
                  <CTableDataCell>{data.positionCode}</CTableDataCell>
                  <CTableDataCell>{data.positionName}</CTableDataCell>
                  <CTableDataCell>{formatDateWithTime(data.createdDate)}</CTableDataCell>
                  <CTableDataCell>{data.createdBy}</CTableDataCell>
                  <CTableDataCell>
                    {accessReady && canDetail && (
                      <CTooltip content="View Details" placement="top" trigger="hover" delay={0}>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2"
                          variant="outline"
                          onClick={() => handleDetail(data.posId)}
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
                          onClick={() => handleEdit(data.posId)}
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
        <CModalHeader onClose={closeModal}>Confirm Delete</CModalHeader>
        <CModalBody>
          Are you sure you want to delete position <strong>{selectedPosition?.positionName}</strong>
          ?
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

export default PositionList
