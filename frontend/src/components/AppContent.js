import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DefaultLayout from '../layout/DefaultLayout'
import ProtectedRoute from './ProtectedRoute'
import Login from '../views/auth/Login'
import SignUp from '../views/auth/SignUp'
import DynamicRoutes from './DynamicRoutes'

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DefaultLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<DynamicRoutes />} />
      </Route>
    </Routes>
  )
}

export default AppContent
