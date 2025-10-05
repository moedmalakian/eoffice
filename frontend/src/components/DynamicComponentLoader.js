import React, { useState, useEffect, Suspense } from 'react'

const RouteFallback = ({ routeName }) => (
  <div className="container-fluid">
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body text-center">
            <h3>{routeName} Page</h3>
            <p>This page is dynamically configured.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const modules = import.meta.glob('../views/**/*.{js,jsx,ts,tsx}')

const DynamicComponentLoader = ({ componentInfo, routeName }) => {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadComponent = async () => {
      if (!componentInfo?.componentName || !componentInfo?.folderPath) {
        setComponent(() => () => <RouteFallback routeName={routeName} />)
        setLoading(false)
        return
      }

      try {
        const filePath = `${componentInfo.folderPath}/${componentInfo.componentName}.js`

        if (modules[filePath]) {
          const module = await modules[filePath]()
          setComponent(() => module.default)
        } else {
          console.warn(`[DynamicLoader] File not found: ${filePath}`)
          setComponent(() => () => <RouteFallback routeName={routeName} />)
        }
      } catch (err) {
        console.error(`[DynamicLoader] Failed to load ${componentInfo.componentName}:`, err)
        setComponent(() => () => <RouteFallback routeName={routeName} />)
      } finally {
        setLoading(false)
      }
    }

    loadComponent()
  }, [componentInfo, routeName])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '200px' }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      {Component ? <Component /> : <RouteFallback routeName={routeName} />}
    </Suspense>
  )
}

export default DynamicComponentLoader
