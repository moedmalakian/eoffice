import React, { useState } from 'react'
import { CInputGroup, CFormInput, CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

/**
 * Search component for filtering data.
 *
 * @param {Object} props - The component props.
 * @param {function} props.onSearch - Callback for search action.
 * @param {string} [props.placeholder] - Placeholder text for the search input.
 * @param {string} [props.size] - Size of the input group (e.g., 'sm', 'md', 'lg').
 * @param {string} [props.buttonColor] - Color of the search button.
 **/

const Search = ({ onSearch, placeholder = 'Search...', size = 'md', buttonColor = 'primary' }) => {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearchClick = () => {
    setLoading(true)
    onSearch(keyword)
    setLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    }
  }

  // Only pass 'sm' or 'lg' to CInputGroup, otherwise undefined (default size)
  const inputGroupSize = size === 'sm' || size === 'lg' ? size : undefined

  return (
    <div className="mb-3 d-flex justify-content-start mt-4 mb-5">
      <CInputGroup className="w-25" size={inputGroupSize}>
        <CFormInput
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <CButton
          type="button"
          color={buttonColor}
          onClick={handleSearchClick}
          disabled={loading}
          variant="outline"
        >
          {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSearch} />}
        </CButton>
      </CInputGroup>
    </div>
  )
}

export default Search
