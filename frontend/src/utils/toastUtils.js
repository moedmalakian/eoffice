import React, { createContext, useContext, useRef, useState } from 'react'
import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilXCircle, cilInfo, cilWarning } from '@coreui/icons'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const toaster = useRef()
  const [toast, setToast] = useState()

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CIcon icon={cilCheckCircle} className="text-success me-2" width={24} height={24} />
      case 'danger':
        return <CIcon icon={cilXCircle} className="text-danger me-2" width={24} height={24} />
      case 'info':
        return <CIcon icon={cilInfo} className="text-info me-2" width={24} height={24} />
      case 'warning':
        return <CIcon icon={cilWarning} className="text-warning me-2" width={24} height={24} />
      default:
        return null
    }
  }

  const getTitle = (type) => {
    switch (type) {
      case 'success':
        return 'Success'
      case 'danger':
        return 'Error'
      case 'info':
        return 'Info'
      case 'warning':
        return 'Warning'
      default:
        return 'Notification'
    }
  }

  const addToast = (message, type = 'success') => {
    const newToast = (
      <CToast key={Date.now()} autohide delay={5000}>
        <CToastHeader closeButton>
          <div className="fw-bold me-auto">{getTitle(type)}</div>
          <small>Just now</small>
        </CToastHeader>
        <CToastBody className="d-flex align-items-center">
          {getIcon(type)}
          <span>{message}</span>
        </CToastBody>
      </CToast>
    )
    setToast(newToast)
  }

  return (
    <ToastContext.Provider
      value={{
        // General
        addToast,
        showSuccessToast: (message = 'Success!') => addToast(message, 'success'),
        showErrorToast: (message = 'Something went wrong.') => addToast(message, 'danger'),

        // Get
        showSuccessGetToast: (message = 'Get data successfully!') => addToast(message, 'success'),
        showErrorGetToast: (message = 'Failed get data! Please try again.') =>
          addToast(message, 'danger'),

        // Create
        showSuccessCreateToast: (message = 'Create data successfully!') =>
          addToast(message, 'success'),
        showErrorCreateToast: (message = 'Failed create data! Please try again.') =>
          addToast(message, 'danger'),

        // Update
        showSuccessUpdateToast: (message = 'Update data successfully!') =>
          addToast(message, 'success'),
        showErrorUpdateToast: (message = 'Failed update data! Please try again.') =>
          addToast(message, 'danger'),

        // Delete
        showSuccessDeleteToast: (message = 'Delete data successfully!') =>
          addToast(message, 'success'),
        showErrorDeleteToast: (message = 'Failed delete data! Please try again.') =>
          addToast(message, 'danger'),
      }}
    >
      {children}
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
