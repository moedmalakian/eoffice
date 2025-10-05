import { useState } from 'react'

const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by this browser'
        setError(errorMsg)
        reject(new Error(errorMsg))
        return
      }

      setLoading(true)
      setError(null)

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=20&addressdetails=1`,
            )

            if (!response.ok) {
              throw new Error('Failed to fetch address')
            }

            const data = await response.json()

            const locationData = {
              latitude,
              longitude,
              address: data.display_name || 'Location coordinates: ' + latitude + ', ' + longitude,
            }

            setLocation(locationData)
            setError(null)
            setLoading(false)
            resolve(locationData)
          } catch (err) {
            const errorMsg = 'Failed to get address information: ' + err.message
            setError(errorMsg)
            setLoading(false)
            reject(new Error(errorMsg))
          }
        },
        (err) => {
          let errorMessage = 'Failed to get location: '

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage += 'Permission denied. Please enable location access.'
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage += 'Position information unavailable.'
              break
            case err.TIMEOUT:
              errorMessage += 'Location request timed out.'
              break
            default:
              errorMessage += 'Unknown error.'
          }

          setError(errorMessage)
          setLoading(false)
          reject(new Error(errorMessage))
        },
        {
          timeout: 15000,
          enableHighAccuracy: true,
        },
      )
    })
  }

  return { location, error, loading, getLocation }
}

export default useGeolocation
