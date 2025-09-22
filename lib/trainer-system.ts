export interface TrainerProfile {
  id: string
  name: string
  bio: string
  specialties: string[]
  rating: number
  totalSessions: number
  profileImage: string
  isLive: boolean
  streamUrl?: string
  hourlyRate: number
  certifications: string[]
  experience: number
  totalTipsReceived: number
  followers: number
}

export interface LiveStream {
  id: string
  trainerId: string
  title: string
  description: string
  category: string
  isLive: boolean
  viewerCount: number
  startTime: Date
  duration: number
  thumbnailUrl: string
  streamUrl: string
  totalTips: number
}

export interface TipTransaction {
  id: string
  fromUserId: string
  toTrainerId: string
  streamId: string
  amount: number
  message: string
  timestamp: Date
  txHash?: string
}

// Mock data for trainers
export const mockTrainers: TrainerProfile[] = [
  {
    id: "trainer-1",
    name: "Sarah Johnson",
    bio: "Certified personal trainer specializing in strength training and high-intensity cardio workouts. 8+ years experience helping clients achieve their fitness goals.",
    specialties: ["Strength Training", "High-Intensity Cardio", "Weight Loss", "Muscle Building"],
    rating: 4.9,
    totalSessions: 1247,
    profileImage: "/female-fitness-trainer.png",
    isLive: true,
    streamUrl: "stream-1",
    hourlyRate: 75,
    certifications: ["NASM-CPT", "ACSM", "Nutrition Specialist"],
    experience: 8,
    totalTipsReceived: 2450,
    followers: 3200,
  },
  {
    id: "trainer-2",
    name: "Mike Rodriguez",
    bio: "Former Olympic athlete turned personal trainer. Specializing in athletic performance and functional movement.",
    specialties: ["Athletic Performance", "Functional Training", "Sports Conditioning"],
    rating: 4.8,
    totalSessions: 892,
    profileImage: "/male-fitness-trainer.png",
    isLive: false,
    hourlyRate: 85,
    certifications: ["CSCS", "FMS", "Olympic Lifting"],
    experience: 12,
    totalTipsReceived: 1890,
    followers: 2800,
  },
  {
    id: "trainer-3",
    name: "Emma Chen",
    bio: "Strength and flexibility coach focused on functional movement and injury prevention training.",
    specialties: ["Strength Training", "Flexibility", "Functional Movement", "Rehabilitation"],
    rating: 4.7,
    totalSessions: 654,
    profileImage: "/diverse-yoga-instructor.png",
    isLive: true,
    streamUrl: "stream-3",
    hourlyRate: 60,
    certifications: ["NASM-CPT", "Corrective Exercise", "Movement Specialist"],
    experience: 6,
    totalTipsReceived: 1200,
    followers: 1900,
  },
]

// Mock live streams
export const mockLiveStreams: LiveStream[] = [
  {
    id: "stream-1",
    trainerId: "trainer-1",
    title: "Morning Cardio Blast - 30 Min Full Body Burn",
    description: "High-intensity cardio training session to kickstart your day. No equipment needed!",
    category: "Cardio",
    isLive: true,
    viewerCount: 47,
    startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 minutes ago
    duration: 30,
    thumbnailUrl: "/hiit-workout.png",
    streamUrl: "https://example.com/stream/1",
    totalTips: 125,
  },
  {
    id: "stream-3",
    trainerId: "trainer-3",
    title: "Functional Strength Training",
    description: "Build strength with functional movement patterns and proper form techniques.",
    category: "Strength",
    isLive: true,
    viewerCount: 23,
    startTime: new Date(Date.now() - 8 * 60 * 1000), // Started 8 minutes ago
    duration: 45,
    thumbnailUrl: "/strength-training.png",
    streamUrl: "https://example.com/stream/3",
    totalTips: 67,
  },
]

export class TrainerService {
  static getTrainers(): TrainerProfile[] {
    return mockTrainers
  }

  static getTrainerById(id: string): TrainerProfile | undefined {
    return mockTrainers.find((trainer) => trainer.id === id)
  }

  static getLiveStreams(): LiveStream[] {
    return mockLiveStreams.filter((stream) => stream.isLive)
  }

  static getStreamById(id: string): LiveStream | undefined {
    return mockLiveStreams.find((stream) => stream.id === id)
  }

  static async sendTip(streamId: string, trainerId: string, amount: number, message: string): Promise<boolean> {
    // Mock tip sending - in real app would integrate with blockchain
    console.log(`Sending ${amount} $GYM tokens to trainer ${trainerId} for stream ${streamId}`)

    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update trainer's total tips
    const trainer = mockTrainers.find((t) => t.id === trainerId)
    if (trainer) {
      trainer.totalTipsReceived += amount
    }

    // Update stream's total tips
    const stream = mockLiveStreams.find((s) => s.id === streamId)
    if (stream) {
      stream.totalTips += amount
    }

    return true
  }

  static followTrainer(trainerId: string): boolean {
    const trainer = mockTrainers.find((t) => t.id === trainerId)
    if (trainer) {
      trainer.followers += 1
      return true
    }
    return false
  }

  static async enableTrainerStreaming(
    walletAddress: string,
    trainerId: string,
  ): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: "You can now start streaming as a trainer!",
    }
  }
}
