// layout/DefaultLayout.js
import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = () => {
  return (
    <div className="d-flex">
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 w-100">
        <AppHeader />
        <div className="body flex-grow-1 d-flex flex-column px-3">
          <Outlet />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
