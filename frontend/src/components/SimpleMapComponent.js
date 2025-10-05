import React from 'react'

const SimpleMapComponent = ({ latitude, longitude, height = '250px' }) => {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&marker=${latitude}%2C${longitude}`

  return (
    <div style={{ height, width: '100%', borderRadius: '5px', overflow: 'hidden' }}>
      {latitude && longitude ? (
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={mapUrl}
          title="Location Map"
          style={{ border: '1px solid #ccc' }}
        ></iframe>
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        >
          <p>Waiting for location...</p>
        </div>
      )}
    </div>
  )
}

export default SimpleMapComponent
