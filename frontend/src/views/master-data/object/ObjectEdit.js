import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CModalFooter,
  CListGroup,
  CListGroupItem,
  CFormSelect,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import { fetchObjectById, updateObject, getParentObject } from '../../../services/objectService'
import { coreUiIconNames } from '../../../utils/coreUiIconNames'
import { useToast } from '../../../utils/toastUtils'

const ObjectEdit = ({ objId, onClose, onSuccess, showEditModal }) => {
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()
  const inputRef = useRef(null)

  const [formData, setFormData] = useState({
    objectName: '',
    accessName: '',
    linkUrl: '',
    folderPath: '',
    slug: '',
    componentName: '',
    isMenu: '',
    icon: '',
    status: '',
    parentObjId: '',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [filteredIcons, setFilteredIcons] = useState([])
  const [error, setError] = useState(null)
  const [parentObjects, setParentObjects] = useState([])
  const [loadingParents, setLoadingParents] = useState(false)
  const [errors, setErrors] = useState({})

  const fetchData = useCallback(async () => {
    try {
      const objectData = await fetchObjectById(objId)
      if (objectData.success && objectData.data) {
        const object = objectData.data
        setFormData({
          objectName: object.objectName,
          accessName: object.accessName,
          linkUrl: object.linkUrl,
          folderPath: object.folderPath,
          slug: object.slug,
          componentName: object.componentName,
          isMenu: object.isMenu,
          icon: object.icon,
          status: object.status,
          parentObjId: object.parentObjId || '',
        })
        setSearchKeyword(object.icon ?? '')
        setError(null)
      } else {
        setError('Object not found.')
      }
    } catch (error) {
      console.error('Failed to fetch object data', error)
      setError('Failed to load data.')
    } finally {
      setIsLoading(false)
    }
  }, [objId])

  const fetchParentObjects = async () => {
    try {
      setLoadingParents(true)
      const response = await getParentObject()
      setParentObjects(response.data)
    } catch (error) {
      console.error('Error fetching parent objects:', error)
    } finally {
      setLoadingParents(false)
    }
  }

  useEffect(() => {
    // Selalu fetch parent objects saat component mount
    fetchParentObjects()
    fetchData()
  }, [fetchData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.objectName.trim()) {
      newErrors.objectName = 'Object name is required'
    }

    if (!formData.accessName.trim()) {
      newErrors.accessName = 'Access name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      // Clear error when field is changed
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    },
    [errors],
  )

  const handleIsMenuChange = useCallback((e) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      isMenu: value,
      // Tidak reset parentObjId ketika mengubah isMenu
    }))
  }, [])

  const handleSearchChange = useCallback((e) => {
    const keyword = e.target.value
    setSearchKeyword(keyword)

    if (!keyword) {
      setFormData((prev) => ({ ...prev, icon: '' }))
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      const filtered = coreUiIconNames.filter((icon) =>
        icon.toLowerCase().includes(keyword.toLowerCase()),
      )
      setFilteredIcons(filtered.map((icon) => ({ label: icon, value: icon })))
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleIconSelect = useCallback((iconName) => {
    setFormData((prev) => ({ ...prev, icon: iconName }))
    setSearchKeyword(iconName)
    setFilteredIcons([])
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return

    try {
      const submitData = {
        ...formData,
        parentObjId: formData.parentObjId === '' ? null : formData.parentObjId,
      }

      await updateObject(objId, submitData)
      showSuccessUpdateToast()
      if (typeof onSuccess === 'function') {
        onSuccess()
      }
      if (typeof onClose === 'function') {
        onClose()
      }
    } catch (error) {
      console.error('Update failed', error)
      if (error.response?.data?.message) {
        setErrors((prev) => ({
          ...prev,
          general: error.response.data.message,
        }))
      }
      showErrorUpdateToast()
      inputRef.current?.focus()
    }
  }, [objId, formData, showSuccessUpdateToast, showErrorUpdateToast, onClose, onSuccess])

  if (isLoading)
    return (
      <div className="text-center">
        <CSpinner /> Loading...
      </div>
    )
  if (error) return <p className="text-danger">{error}</p>

  return (
    <CForm>
      {errors.general && (
        <CAlert color="danger" className="mb-3">
          {errors.general}
        </CAlert>
      )}

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="objectName">Object Name*</CFormLabel>
          <CFormInput
            id="objectName"
            name="objectName"
            value={formData.objectName}
            onChange={handleChange}
            required
            ref={inputRef}
            invalid={!!errors.objectName}
          />
          {errors.objectName && (
            <div className="invalid-feedback" style={{ display: 'block' }}>
              {errors.objectName}
            </div>
          )}
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="accessName">Access Name*</CFormLabel>
          <CFormInput
            id="accessName"
            name="accessName"
            value={formData.accessName}
            onChange={handleChange}
            required
            invalid={!!errors.accessName}
          />
          {errors.accessName && (
            <div className="invalid-feedback" style={{ display: 'block' }}>
              {errors.accessName}
            </div>
          )}
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="folderPath">Folder Path</CFormLabel>
          <CFormInput
            id="folderPath"
            name="folderPath"
            value={formData.folderPath}
            onChange={handleChange}
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="linkUrl">Link URL</CFormLabel>
          <CFormInput
            id="linkUrl"
            name="linkUrl"
            value={formData.linkUrl}
            onChange={handleChange}
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="componentName">Component Name</CFormLabel>
          <CFormInput
            id="componentName"
            name="componentName"
            value={formData.componentName}
            onChange={handleChange}
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="slug">Slug</CFormLabel>
          <CFormInput id="slug" name="slug" value={formData.slug} onChange={handleChange} />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormSelect
            id="status"
            name="status"
            label="Status*"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Y">Active</option>
            <option value="N">Not Active</option>
          </CFormSelect>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="icon">Icon*</CFormLabel>
          <div className="position-relative">
            <CFormInput
              type="text"
              id="icon"
              value={searchKeyword}
              onChange={handleSearchChange}
              placeholder="Search Icon Name"
              style={{ paddingLeft: '40px' }}
            />
            {isSearching && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                }}
              >
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {formData.icon && (
              <div
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '55%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                }}
              >
                <CIcon icon={iconSet[formData.icon]} size="lg" />
              </div>
            )}
          </div>

          {filteredIcons.length > 0 && !formData.icon && (
            <CListGroup style={{ maxHeight: '125px', overflowY: 'auto' }}>
              {filteredIcons.map((icon) => (
                <CListGroupItem
                  key={icon.value}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleIconSelect(icon.value)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CIcon icon={iconSet[icon.value]} size="sm" />
                    {icon.label}
                  </div>
                </CListGroupItem>
              ))}
            </CListGroup>
          )}
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormSelect
            id="isMenu"
            name="isMenu"
            label="Type"
            value={formData.isMenu}
            onChange={handleIsMenuChange}
          >
            <option value="Y">Menu</option>
            <option value="N">Action</option>
          </CFormSelect>
        </CCol>
        <CCol md={6}>
          <CFormSelect
            id="parentObjId"
            name="parentObjId"
            label="Parent Menu"
            value={formData.parentObjId}
            onChange={handleChange}
            disabled={loadingParents}
          >
            <option value="">Select Parent Menu</option>
            {parentObjects.map((parent) => (
              <option key={parent.objId} value={parent.objId}>
                {parent.objectName}
              </option>
            ))}
          </CFormSelect>
          {loadingParents && (
            <div className="mt-2">
              <small className="text-muted">Loading parent menus...</small>
            </div>
          )}
        </CCol>
      </CRow>

      <br />
      <CModalFooter className="justify-content-end">
        <CButton color="secondary" onClick={onClose} className="me-2">
          Close
        </CButton>
        <CButton color="primary" onClick={handleSubmit}>
          Update Data
        </CButton>
      </CModalFooter>
    </CForm>
  )
}

export default ObjectEdit
