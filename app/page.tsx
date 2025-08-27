'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StepTracker } from '@/components/step-tracker'
import { walletAdapters, type WalletAdapter } from '@/lib/wallet'
import { getCurrentLocation, isWithinGymRange, type Location, type Gym } from '@/lib/location'
import { 
  Wallet, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Dumbbell,
  Activity,
  Trophy,
  Target
} from 'lucide-react'

// Mock gym data
const mockGyms: Gym[] = [
  {
    id: '1',
    name: "Gold's Gym Downtown",
    address: '123 Main St, Downtown',
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    id: '2',
    name: 'Planet Fitness Central',
    address: '456 Oak Ave, Central District',
    latitude: 40.7589,
    longitude: -73.9851,
  },
]

export default function HomePage() {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [nearbyGyms, setNearbyGyms] = useState<Gym[]>([])
  const [checkedInGym, setCheckedInGym] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'checkin'>('overview')

  useEffect(() => {
    // Check for existing wallet connection
    const savedWallet = localStorage.getItem('connected_wallet')
    const savedAddress = localStorage.getItem('wallet_address')
    if (savedWallet && savedAddress) {
      setConnectedWallet(savedWallet)
      setWalletAddress(savedAddress)
    }

    // Get user location
    getUserLocation()
  }, [])

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      setLocationError(null)
      
      // Find nearby gyms
      const nearby = mockGyms.filter(gym => 
        isWithinGymRange(location, gym, 1000) // 1km range for demo
      )
      setNearbyGyms(nearby)
    } catch (error) {
      setLocationError('Unable to get your location. Please enable location services.')
      console.error('Location error:', error)
    }
  }

  const connectWallet = async (adapter: WalletAdapter) => {
    setIsConnecting(true)
    try {
      const address = await adapter.connect()
      setConnectedWallet(adapter.name)
      setWalletAddress(address)
      
      // Save to localStorage
      localStorage.setItem('connected_wallet', adapter.name)
      localStorage.setItem('wallet_address', address)
    } catch (error) {
      console.error('Wallet connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    const adapter = walletAdapters.find(a => a.name === connectedWallet)
    if (adapter) {
      await adapter.disconnect()
    }
    
    setConnectedWallet(null)
    setWalletAddress(null)
    localStorage.removeItem('connected_wallet')
    localStorage.removeItem('wallet_address')
  }

  const checkInToGym = (gymId: string) => {
    setCheckedInGym(gymId)
    // In a real app, this would save to database
    localStorage.setItem('checked_in_gym', gymId)
  }

  const checkOutFromGym = () => {
    setCheckedInGym(null)
    localStorage.removeItem('checked_in_gym')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900">
      {/* Header */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-2">GYMONAD</h1>
          <p className="text-lg md:text-xl opacity-90">Web3 Fitness Tracker</p>
          {connectedWallet && (
            <Badge variant="secondary" className="mt-2">
              Connected: {connectedWallet}
            </Badge>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-16 relative z-20">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex gap-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'steps' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('steps')}
              className="text-white"
            >
              <Activity className="h-4 w-4 mr-2" />
              Steps
            </Button>
            <Button
              variant={activeTab === 'checkin' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('checkin')}
              className="text-white"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Check-in
            </Button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Wallet Connection */}
            <Card className="bg-black/50 backdrop-blur-sm border-purple-500/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-purple-400" />
                  Wallet Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!connectedWallet ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300 mb-4">
                      Connect your Web3 wallet to start tracking your fitness journey
                    </p>
                    {walletAdapters.map((adapter) => (
                      <Button
                        key={adapter.name}
                        onClick={() => connectWallet(adapter)}
                        disabled={isConnecting || !adapter.isInstalled()}
                        className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                      >
                        {isConnecting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <span className="mr-2">{adapter.icon}</span>
                        )}
                        {adapter.isInstalled() ? `Connect ${adapter.name}` : `Install ${adapter.name}`}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Connected to {connectedWallet}</span>
                    </div>
                    <div className="text-xs text-gray-400 break-all">
                      {walletAddress}
                    </div>
                    <Button
                      onClick={disconnectWallet}
                      variant="outline"
                      size="sm"
                      className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-black/50 backdrop-blur-sm border-purple-500/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Today's Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Steps</span>
                    <span className="text-purple-400 font-semibold">7,234 / 10,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Calories</span>
                    <span className="text-purple-400 font-semibold">289 / 400</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gym Visits</span>
                    <span className="text-purple-400 font-semibold">1 / 1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Status */}
            <Card className="bg-black/50 backdrop-blur-sm border-purple-500/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  Location Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {locationError ? (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{locationError}</span>
                  </div>
                ) : userLocation ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Location enabled</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {nearbyGyms.length} nearby gyms found
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Getting location...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="max-w-2xl mx-auto">
            <StepTracker />
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Nearby Gyms */}
            <Card className="bg-black/50 backdrop-blur-sm border-purple-500/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-purple-400" />
                  Nearby Gyms
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nearbyGyms.length > 0 ? (
                  <div className="space-y-4">
                    {nearbyGyms.map((gym) => (
                      <div key={gym.id} className="border border-purple-500/20 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{gym.name}</h3>
                            <p className="text-sm text-gray-400">{gym.address}</p>
                          </div>
                          {checkedInGym === gym.id ? (
                            <Button
                              onClick={checkOutFromGym}
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                            >
                              Check Out
                            </Button>
                          ) : (
                            <Button
                              onClick={() => checkInToGym(gym.id)}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Check In
                            </Button>
                          )}
                        </div>
                        {checkedInGym === gym.id && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Currently checked in
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No gyms found nearby</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Make sure location services are enabled
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}