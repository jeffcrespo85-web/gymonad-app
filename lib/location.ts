// Location utilities for gym check-ins
export interface Location {
  latitude: number
  longitude: number
}

export interface Gym {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(pos1: Location, pos2: Location): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (pos1.latitude * Math.PI) / 180
  const φ2 = (pos2.latitude * Math.PI) / 180
  const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180
  const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Get user's current location
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}

// Check if user is within range of a gym (default 100 meters)
export function isWithinGymRange(userLocation: Location, gym: Gym, maxDistance = 100): boolean {
  const distance = calculateDistance(userLocation, {
    latitude: gym.latitude,
    longitude: gym.longitude,
  })
  return distance <= maxDistance
}
