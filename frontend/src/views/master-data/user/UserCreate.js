import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser } from '../../../services/userService'
import { fetchRoles } from '../../../services/roleService'
import { searchEmployee } from '../../../services/employeeService'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import useDebounce from '../../../utils/useDebounce'

const UserCreate = () => {
  const navigate = useNavigate()
  const { showSuccessCreateToast, showErrorCreateToast } = useToast()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('UserCreate'))
  }, [])

  useEffect(() => {
    if (accessReady && !canCreate) {
      const url = getObjectLink('UserList')
      navigate(url || '/')
    }
  }, [accessReady, canCreate, navigate])

  const storedUser = JSON.parse(localStorage.getItem('userDetail') || '{}')
  const [formData, setFormData] = useState({
    empId: '',
    rolId: '',
    username: '',
    password: '',
    email: '',
    status: 'Y',
    createdDate: formatDateWithTime(new Date()),
    createdBy: storedUser.username || 'UNKNOWN',
  })

  const [searchKeyword, setSearchKeyword] = useState('')
  const [employeeResults, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [roles, setRoles] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSelectedEmployee, setHasSelectedEmployee] = useState(false)

  // useDebounce
  const debouncedSearchTerm = useDebounce(searchKeyword, 500)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleResponse = await fetchRoles()
        if (roleResponse.success) {
          setRoles(roleResponse.data)
        } else {
          showErrorCreateToast('Failed to fetch roles.')
        }
      } catch (err) {
        console.error('Error fetching roles:', err)
        showErrorCreateToast('Error fetching roles.')
      }
    }
    fetchData()
  }, [showErrorCreateToast])

  useEffect(() => {
    const performSearch = async () => {
      if (
        hasSelectedEmployee &&
        searchKeyword === (selectedEmployee?.fullname || selectedEmployee?.fullName || '')
      ) {
        setEmployees([])
        return
      }

      if (debouncedSearchTerm && debouncedSearchTerm.length > 1) {
        setIsSearching(true)
        try {
          const response = await searchEmployee(debouncedSearchTerm)
          if (Array.isArray(response.data)) {
            setEmployees(response.data)
          } else {
            setEmployees([])
          }
        } catch (err) {
          console.error('Error searching employee:', err)
          setEmployees([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setEmployees([])
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, hasSelectedEmployee, searchKeyword, selectedEmployee])

  const handleSearchChange = (e) => {
    const keyword = e.target.value
    setSearchKeyword(keyword)
    if (
      hasSelectedEmployee &&
      keyword !== (selectedEmployee?.fullname || selectedEmployee?.fullName || '')
    ) {
      setHasSelectedEmployee(false)
      setSelectedEmployee(null)
      setFormData((prev) => ({
        ...prev,
        empId: '',
        fullName: '',
        divisionName: '',
        positionName: '',
        email: '',
        phone: '',
      }))
    }
  }

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp)
    setHasSelectedEmployee(true)
    setFormData((prev) => ({
      ...prev,
      empId: emp.empId || emp.emp_id || '',
      fullName: emp.fullname || emp.fullName || '',
      divisionName: emp.division_name || emp.divisionName || '',
      positionName: emp.position_name || emp.positionName || '',
      email: emp.email || '',
      phone: emp.phone || '',
    }))
    setSearchKeyword(emp.fullname || emp.fullName || '')
    setEmployees([])
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value || '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formData }
      await createUser(payload)
      showSuccessCreateToast()
      const url = getObjectLink('UserList')
      setTimeout(() => navigate(url || '/'), 1000)
    } catch (err) {
      console.error('Error creating user:', err)
      showErrorCreateToast('Failed to create user.')
    }
  }

  return (
    <div>
      <h4 className="mb-4">Master Data - User</h4>
      <CCard>
        <CCardHeader>
          <strong>Create - User</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="fullName">Full Name</CFormLabel>
                <div className="position-relative">
                  <CFormInput
                    type="text"
                    id="fullName"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    placeholder="Search employee"
                    required
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
                </div>

                {employeeResults.length > 0 && !hasSelectedEmployee && (
                  <CListGroup className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {employeeResults.map((emp, index) => (
                      <CListGroupItem
                        key={emp.empId || emp.emp_id || `emp-${index}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        {emp.fullname || emp.fullName} - {emp.position_name || emp.positionName} /{' '}
                        {emp.division_name || emp.divisionName}
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel htmlFor="empId">Emp ID</CFormLabel>
                <CFormInput
                  type="text"
                  id="empId"
                  name="empId"
                  value={formData.empId || ''}
                  disabled
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="divisionName">Division</CFormLabel>
                <CFormInput
                  type="text"
                  id="divisionName"
                  value={formData.divisionName || ''}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="positionName">Position</CFormLabel>
                <CFormInput
                  type="text"
                  id="positionName"
                  value={formData.positionName || ''}
                  disabled
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="username">Username</CFormLabel>
                <CFormInput
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="password">Password</CFormLabel>
                <CFormInput
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="email">Email</CFormLabel>
                <CFormInput
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="rolId">Role</CFormLabel>
                <CFormSelect
                  id="rolId"
                  name="rolId"
                  value={formData.rolId || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.rolId} value={role.rolId}>
                      {role.roleName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="status">Status User</CFormLabel>
                <CFormSelect
                  id="status"
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="Y">Active</option>
                  <option value="N">Not Active</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="createdDate">Created Date</CFormLabel>
                <CFormInput
                  type="text"
                  id="createdDate"
                  name="createdDate"
                  value={formData.createdDate || ''}
                  disabled
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="createdBy">Created By</CFormLabel>
                <CFormInput
                  type="text"
                  id="createdBy"
                  name="createdBy"
                  value={formData.createdBy || ''}
                  disabled
                />
              </CCol>
            </CRow>
            <br />
            <CButton type="submit" color="primary">
              Save Data
            </CButton>{' '}
            <CButton color="secondary" onClick={() => navigate(getObjectLink('UserList') || '/')}>
              Cancel
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default UserCreate
