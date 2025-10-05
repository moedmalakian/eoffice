import React, { useEffect } from 'react'
import { CPagination, CPaginationItem, CFormSelect } from '@coreui/react'

const Pagination = ({
  currentPage = 1,
  totalPages = 0,
  onPageChange = () => {},
  limit = 0,
  onLimitChange = () => {},
  totalEntries = 0,
}) => {
  const maxPagesToShow = 5
  if (totalPages <= 0) return null

  const limitOptions = [5, 10, 20, 30, 50, 100]

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages)
    }
  }, [currentPage, totalPages, onPageChange])

  const generatePageNumbers = () => {
    const pages = []

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      pages.push(1)
      if (startPage > 2) pages.push('...')
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      if (endPage < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10)
    onLimitChange(newLimit)
    onPageChange(1)
  }

  const fromEntry = totalEntries === 0 ? 0 : (currentPage - 1) * limit + 1
  const toEntry = Math.min(currentPage * limit, totalEntries)

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap mt-4 gap-2 mb-4">
      <div className="d-flex align-items-center">
        <CPagination className="mb-0" size="sm">
          <CPaginationItem
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            &laquo;
          </CPaginationItem>

          {generatePageNumbers().map((number, index) => (
            <CPaginationItem
              key={`${number}-${index}`}
              active={number === currentPage}
              disabled={number === '...'}
              onClick={() => number !== '...' && handlePageChange(number)}
              style={{ cursor: number === '...' ? 'default' : 'pointer' }}
            >
              {number}
            </CPaginationItem>
          ))}

          <CPaginationItem
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            &raquo;
          </CPaginationItem>
        </CPagination>
      </div>

      <div className="d-flex align-items-center ms-auto flex-wrap gap-3">
        <div className="d-flex align-items-center">
          <CFormSelect
            size="sm"
            value={limit}
            onChange={handleLimitChange}
            style={{ width: '75px' }}
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </CFormSelect>
        </div>
        <div>
          <span>
            Showing {fromEntry} - {toEntry} of {totalEntries}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Pagination
