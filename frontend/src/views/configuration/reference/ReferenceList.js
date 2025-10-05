import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchReferences, deleteReference } from '../../../services/referenceService'
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

const ReferenceList = () => {
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedReference, setSelectedReference] = useState(null)
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
    setCanCreate(hasAccessSync('ReferenceCreate'))
    setCanEdit(hasAccessSync('ReferenceEdit'))
    setCanDetail(hasAccessSync('ReferenceDetail'))
    setCanDelete(hasAccessSync('ReferenceDelete'))
  }, [])

  const loadReferences = async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, limit, search: debouncedSearchTerm.trim() }
      const result = await fetchReferences(params)

      if (result.success) {
        setReferences(result.data)
        setTotalItems(result.totalData)
        setError(null)
      } else {
        setError('Invalid data format from API')
      }
    } catch (err) {
      console.error('Error fetching references:', err)
      setError('Failed to fetch references')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReferences()
  }, [currentPage, limit, debouncedSearchTerm])

  const handleCreate = () => {
    const url = getObjectLink('ReferenceCreate')
    if (!url) {
      console.warn('[ReferenceList] Link for ReferenceCreate not found or has unresolved params.')
      return
    }
    navigate(url)
  }

  const handleDetail = (rfhId) => {
    const url = getObjectLink('ReferenceDetail', { rfhId })
    if (!url) {
      console.warn('[ReferenceList] Link for ReferenceDetail not found or has unresolved params.', {
        rfhId,
      })
      return
    }
    navigate(url)
  }

  const handleEdit = (rfhId) => {
    const url = getObjectLink('ReferenceEdit', { rfhId })
    if (!url) {
      console.warn('[ReferenceList] Link for ReferenceEdit not found or has unresolved params.', {
        rfhId,
      })
      return
    }
    navigate(url)
  }

  const handleDelete = async () => {
    if (!selectedReference?.rfhId) return
    try {
      await deleteReference(selectedReference.rfhId)
      showSuccessDeleteToast()
      loadReferences()
      closeModal()
    } catch (err) {
      console.error('Failed to delete reference:', err)
      showErrorDeleteToast()
    }
  }

  const openModal = (ref) => {
    setSelectedReference(ref)
    setDeleteModal(true)
  }

  const closeModal = () => {
    setSelectedReference(null)
    setDeleteModal(false)
    if (focusRef.current) {
      focusRef.current.focus()
    }
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Master Data - Reference</h4>
        {accessReady && canCreate && (
          <CButton color="primary" onClick={handleCreate} ref={focusRef}>
            Create Reference
          </CButton>
        )}
      </div>

      <Search onSearch={setSearchTerm} placeholder="Search reference" buttonColor="info" />

      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading references...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>No.</CTableHeaderCell>
                <CTableHeaderCell>Reference Code</CTableHeaderCell>
                <CTableHeaderCell>Reference Name</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Created Date</CTableHeaderCell>
                <CTableHeaderCell>Created By</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {references.length > 0 ? (
                references.map((data, index) => (
                  <CTableRow key={data.rfhId || index}>
                    <CTableDataCell>{(currentPage - 1) * limit + index + 1}</CTableDataCell>
                    <CTableDataCell>{data.referenceCode}</CTableDataCell>
                    <CTableDataCell>{data.referenceName}</CTableDataCell>
                    <CTableDataCell>{data.description}</CTableDataCell>
                    <CTableDataCell>{formatDateWithTime(data.createdDate)}</CTableDataCell>
                    <CTableDataCell>{data.createdBy}</CTableDataCell>
                    <CTableDataCell>
                      {accessReady && canDetail && (
                        <CTooltip content="View Data">
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            variant="outline"
                            onClick={() => handleDetail(data.rfhId)}
                          >
                            <CIcon icon={cilSearch} />
                          </CButton>
                        </CTooltip>
                      )}

                      {accessReady && canEdit && (
                        <CTooltip content="Edit Data">
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            variant="outline"
                            onClick={() => handleEdit(data.rfhId)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                        </CTooltip>
                      )}

                      {accessReady && canDelete && (
                        <CTooltip content="Delete Data">
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
                  <CTableDataCell colSpan="7" className="text-center">
                    No references found.
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
        <CModalBody>
          Are you sure you want to delete reference{' '}
          <strong>{selectedReference?.referenceCode}</strong> ?
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

export default ReferenceList
