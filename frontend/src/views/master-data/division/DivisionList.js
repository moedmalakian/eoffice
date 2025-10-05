import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDivisions, deleteDivision } from '../../../services/divisionService'
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

const DivisionList = () => {
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState(null)
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
    setCanCreate(hasAccessSync('DivisionCreate'))
    setCanEdit(hasAccessSync('DivisionEdit'))
    setCanDetail(hasAccessSync('DivisionDetail'))
    setCanDelete(hasAccessSync('DivisionDelete'))
  }, [])

  const loadDivisions = async () => {
    try {
      setLoading(true)

      const params = { page: currentPage, limit, search: debouncedSearchTerm.trim() }
      const result = await fetchDivisions(params)

      if (result.success) {
        setDivisions(result.data)
        setTotalItems(result.totalData)
        setError(null)
      } else {
        setError('Invalid data format from API')
      }
    } catch (err) {
      console.error('Error fetching divisions:', err)
      setError('Failed to fetch divisions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDivisions()
  }, [currentPage, limit, debouncedSearchTerm])

  const handleCreate = () => {
    const url = getObjectLink('DivisionCreate')
    if (!url) {
      console.warn('[DivisionList] Link for DivisionCreate not found or has unresolved params.')
      return
    }
    navigate(url)
  }

  const handleDetail = (divId) => {
    const url = getObjectLink('DivisionDetail', { divId })
    if (!url) {
      console.warn('[DivisionList] Link for DivisionDetail not found or has unresolved params.', {
        divId,
      })
      return
    }
    navigate(url)
  }

  const handleEdit = (divId) => {
    const url = getObjectLink('DivisionEdit', { divId })
    if (!url) {
      console.warn('[DivisionList] Link for DivisionEdit not found or has unresolved params.', {
        divId,
      })
      return
    }
    navigate(url)
  }

  const handleDelete = async () => {
    if (!selectedDivision?.divId) return
    try {
      await deleteDivision(selectedDivision.divId)
      showSuccessDeleteToast()
      loadDivisions()
      closeModal()
    } catch (err) {
      console.error('Failed to delete division:', err)
      showErrorDeleteToast()
    }
  }

  const openModal = (division) => {
    setSelectedDivision(division)
    setDeleteModal(true)
  }

  const closeModal = () => {
    setSelectedDivision(null)
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
        <h4>Master Data - Division</h4>

        {accessReady && canCreate && (
          <CButton color="primary" onClick={handleCreate} ref={focusRef}>
            Create Division
          </CButton>
        )}
      </div>

      <Search onSearch={handleSearch} placeholder="Search division" buttonColor="info" />

      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading divisions...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>No.</CTableHeaderCell>
                <CTableHeaderCell>Division Code</CTableHeaderCell>
                <CTableHeaderCell>Division Name</CTableHeaderCell>
                <CTableHeaderCell>Created Date</CTableHeaderCell>
                <CTableHeaderCell>Created By</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {divisions.length > 0 ? (
                divisions.map((data, index) => (
                  <CTableRow key={data.divId || index}>
                    <CTableDataCell>{(currentPage - 1) * limit + index + 1}</CTableDataCell>
                    <CTableDataCell>{data.divisionCode}</CTableDataCell>
                    <CTableDataCell>{data.divisionName}</CTableDataCell>
                    <CTableDataCell>{formatDateWithTime(data.createdDate)}</CTableDataCell>
                    <CTableDataCell>{data.createdBy}</CTableDataCell>
                    <CTableDataCell>
                      {accessReady && canDetail && (
                        <CTooltip content="View Data" placement="top" trigger="hover" delay={0}>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            variant="outline"
                            onClick={() => handleDetail(data.divId)}
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
                            onClick={() => handleEdit(data.divId)}
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
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="10" className="text-center">
                    No divisions found.
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

      <CModal visible={deleteModal} onClose={closeModal}>
        <CModalHeader onClose={closeModal}>Confirm Delete</CModalHeader>
        <CModalBody>Are you sure you want to delete this division?</CModalBody>
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

export default DivisionList
