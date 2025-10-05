import React, { useState, useEffect } from 'react'
import { createObject, getParentObject } from '../../../services/objectService'
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
  CAlert,
} from '@coreui/react'
import * as iconSet from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { coreUiIconNames } from '../../../utils/coreUiIconNames'
import { useToast } from '../../../utils/toastUtils'

const ObjectCreate = ({ onClose, onSuccess }) => {
  const { showSuccessCreateToast, showErrorCreateToast } = useToast()
  const [form, setForm] = useState({
    objectName: '',
    accessName: '',
    linkUrl: '',
    folderPath: '',
    slug: '',
    componentName: '',
    isMenu: 'Y',
    icon: '',
    status: 'Y',
    parentObjId: '',
  })

  const [searchKeyword, setSearchKeyword] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [filteredIcons, setFilteredIcons] = useState([])
  const [parentObjects, setParentObjects] = useState([])
  const [loadingParents, setLoadingParents] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchParentObjects()
  }, [])

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

  const validateForm = () => {
    const newErrors = {}

    if (!form.objectName.trim()) {
      newErrors.objectName = 'Object name is required'
    }

    if (!form.accessName.trim()) {
      newErrors.accessName = 'Access name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSearchChange = (e) => {
    const keyword = e.target.value
    setSearchKeyword(keyword)

    if (!keyword) {
      setForm({ ...form, icon: '' })
    }

    setIsSearching(true)

    setTimeout(() => {
      const filtered = coreUiIconNames.filter((icon) =>
        icon.toLowerCase().includes(keyword.toLowerCase()),
      )
      setFilteredIcons(filtered.map((icon) => ({ label: icon, value: icon })))
      setIsSearching(false)
    }, 300)
  }

  const handleIconSelect = (iconName) => {
    setForm({ ...form, icon: iconName })
    setSearchKeyword(iconName)
    setFilteredIcons([])
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleIsMenuChange = (e) => {
    const value = e.target.value
    setForm({
      ...form,
      isMenu: value,
    })
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const submitData = {
        ...form,
        parentObjId: form.parentObjId === '' ? null : form.parentObjId,
      }

      await createObject(submitData)
      showSuccessCreateToast()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Create failed', error)
      if (error.response?.data?.message) {
        setErrors((prev) => ({
          ...prev,
          general: error.response.data.message,
        }))
      }
      showErrorCreateToast()
    }
  }

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
            value={form.objectName}
            onChange={handleChange}
            placeholder="Enter Object Name"
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
            value={form.accessName}
            onChange={handleChange}
            placeholder="Enter Access Name"
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
            value={form.folderPath}
            onChange={handleChange}
            placeholder="Enter Folder Path"
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="linkUrl">Link URL</CFormLabel>
          <CFormInput
            id="linkUrl"
            name="linkUrl"
            value={form.linkUrl}
            onChange={handleChange}
            placeholder="Enter Link URL"
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="componentName">Component Name</CFormLabel>
          <CFormInput
            id="componentName"
            name="componentName"
            value={form.componentName}
            onChange={handleChange}
            placeholder="Enter Component Name"
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="slug">Slug</CFormLabel>
          <CFormInput
            id="slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Enter Slug"
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormSelect
            id="status"
            name="status"
            label="Status*"
            value={form.status}
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

            {form.icon && (
              <div
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '55%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                }}
              >
                <CIcon icon={iconSet[form.icon]} size="lg" />
              </div>
            )}
          </div>

          {filteredIcons.length > 0 && !form.icon && (
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
            value={form.isMenu}
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
            value={form.parentObjId}
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
          Save Data
        </CButton>
      </CModalFooter>
    </CForm>
  )
}

export default ObjectCreate
