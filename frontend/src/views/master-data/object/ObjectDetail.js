import React, { useEffect, useState, useCallback } from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import { fetchObjectById, getParentObject } from 'src/services/objectService'
import { coreUiIconNames } from 'src/utils/coreUiIconNames'

const ObjectDetail = ({ objId, onClose }) => {
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
  const [isTrigger, setIsTrigger] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [error, setError] = useState(null)
  const [parentObjectName, setParentObjectName] = useState('')

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

        if (object.parentObjId) {
          try {
            const parentResponse = await fetchObjectById(object.parentObjId)
            if (parentResponse.success && parentResponse.data) {
              setParentObjectName(parentResponse.data.objectName)
            }
          } catch (error) {
            console.error('Error fetching parent object:', error)
          }
        }
      } else {
        setError('Object not found.')
      }
    } catch (error) {
      console.error('Failed to fetch object data', error)
      setError('Failed to load data.')
    }
  }, [objId])

  useEffect(() => {
    if (!isLoading && isTrigger) {
      fetchData()
    }
  }, [isLoading, isTrigger, fetchData])

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false)
      setIsTrigger(true)
    }
  }, [isLoading])

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-danger">{error}</p>

  return (
    <CForm>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="objectName">Object Name</CFormLabel>
          <CFormInput id="objectName" name="objectName" value={formData.objectName} disabled />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="accessName">Access Name</CFormLabel>
          <CFormInput id="accessName" name="accessName" value={formData.accessName} disabled />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="folderPath">Folder Path</CFormLabel>
          <CFormInput id="folderPath" name="folderPath" value={formData.folderPath} disabled />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="linkUrl">Link URL</CFormLabel>
          <CFormInput id="linkUrl" name="linkUrl" value={formData.linkUrl} disabled />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="componentName">Component Name</CFormLabel>
          <CFormInput
            id="componentName"
            name="componentName"
            value={formData.componentName}
            disabled
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="slug">Slug</CFormLabel>
          <CFormInput id="slug" name="slug" value={formData.slug} disabled />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="status">Status Menu</CFormLabel>
          <CFormSelect id="status" name="status" value={formData.status} disabled>
            <option value="Y">Active</option>
            <option value="N">Not Active</option>
          </CFormSelect>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="icon">Icon</CFormLabel>
          <div className="position-relative">
            <CFormInput
              type="text"
              id="icon"
              value={searchKeyword}
              disabled
              style={{ paddingLeft: '40px' }}
            />
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
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="isMenu">Type</CFormLabel>
          <CFormSelect id="isMenu" name="isMenu" value={formData.isMenu} disabled>
            <option value="Y">Menu</option>
            <option value="N">Action</option>
          </CFormSelect>
        </CCol>

        <CCol md={6}>
          <CFormLabel htmlFor="parentObjId">Parent Menu</CFormLabel>
          <CFormInput
            id="parentObjId"
            name="parentObjId"
            value={parentObjectName || '-'}
            disabled
          />
        </CCol>
      </CRow>

      <br />
      <CModalFooter className="justify-content-end">
        <CButton color="secondary" onClick={onClose} className="me-2">
          Close
        </CButton>
      </CModalFooter>
    </CForm>
  )
}

export default ObjectDetail
