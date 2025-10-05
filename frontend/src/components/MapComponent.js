import React, { useEffect, useRef } from 'react'

const MapComponent = ({ latitude, longitude, height = '250px' }) => {
  const mapContainer = useRef(null)

  useEffect(() => {
    // Load Leaflet CSS dynamically
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
    link.integrity =
      'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Load Leaflet JS dynamically
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
    script.integrity =
      'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=='
    script.crossOrigin = ''
    script.onload = initializeMap
    document.head.appendChild(script)

    function initializeMap() {
      if (!mapContainer.current || !window.L) return

      // Initialize map
      const map = window.L.map(mapContainer.current).setView(
        [latitude || -6.2, longitude || 106.8],
        13,
      )

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add marker if coordinates are provided
      if (latitude && longitude) {
        window.L.marker([latitude, longitude]).addTo(map).bindPopup('Your location').openPopup()
      }

      // Cleanup function
      return () => {
        if (map) {
          map.remove()
        }
      }
    }

    return () => {
      // Clean up dynamically added resources
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [latitude, longitude])

  return (
    <div
      ref={mapContainer}
      style={{
        height,
        width: '100%',
        borderRadius: '5px',
        border: '1px solid #ccc',
      }}
    />
  )
}

export default MapComponent
