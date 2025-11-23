export const currentUser = {
  name: "Alex Quantum",
  handle: "@alex_q",
  avatar: "/placeholder.svg",
  bio: "Quantum computing enthusiast | Building the future one qubit at a time",
  email: "alex@hqcc.org",
}

export const users = [
  {
    name: "Alex Quantum",
    handle: "@alex_q",
    avatar: "/placeholder.svg",
    bio: "Quantum computing enthusiast | Building the future one qubit at a time",
  },
  {
    name: "Sarah Chen",
    handle: "@quantum_sarah",
    avatar: "/placeholder.svg",
    bio: "PhD in Quantum Algorithms | IBM Qiskit Developer",
  },
  {
    name: "Mike Rodriguez",
    handle: "@mike_quantum",
    avatar: "/placeholder.svg",
    bio: "Quantum hardware engineer | Superconducting qubits",
  },
  {
    name: "Emma Watson",
    handle: "@emma_q",
    avatar: "/placeholder.svg",
    bio: "Quantum cryptography researcher | Post-quantum security",
  },
  {
    name: "David Kim",
    handle: "@david_quantum",
    avatar: "/placeholder.svg",
    bio: "Quantum ML researcher | TensorFlow Quantum",
  },
  {
    name: "Lisa Park",
    handle: "@lisa_q",
    avatar: "/placeholder.svg",
    bio: "Quantum error correction | Fault-tolerant computing",
  },
]

export const initialPosts = [
  {
    id: 1,
    user: {
      name: "Alex Quantum",
      handle: "@alex_q",
      avatar: "/placeholder.svg",
    },
    content: "Just finished reading about Shor's algorithm! The mathematical elegance behind quantum factorization is mind-blowing. 🧮✨",
    timestamp: "2h",
    likes: 24,
    comments: 5,
    shares: 3,
  },
  {
    id: 2,
    user: {
      name: "Sarah Chen",
      handle: "@quantum_sarah",
      avatar: "/placeholder.svg",
    },
    content: "Excited to announce our new quantum computing workshop next month! We'll cover everything from basics to advanced algorithms. Register now! 🚀",
    timestamp: "5h",
    likes: 42,
    comments: 12,
    shares: 8,
  },
  {
    id: 3,
    user: {
      name: "Mike Rodriguez",
      handle: "@mike_quantum",
      avatar: "/placeholder.svg",
    },
    content: "Working on improving coherence times in our superconducting qubits. Progress is slow but steady! 💪",
    timestamp: "1d",
    likes: 18,
    comments: 4,
    shares: 2,
  },
  {
    id: 4,
    user: {
      name: "Alex Quantum",
      handle: "@alex_q",
      avatar: "/placeholder.svg",
    },
    content: "Quantum entanglement never fails to amaze me. The fact that particles can be correlated across vast distances challenges our understanding of reality itself.",
    timestamp: "2d",
    likes: 31,
    comments: 7,
    shares: 5,
  },
]

export const events = [
  {
    id: 1,
    title: "Quantum Computing Workshop",
    description: "Learn the fundamentals of quantum computing, including qubits, gates, and algorithms. Hands-on session with IBM Qiskit.",
    type: "workshop",
    date: "2024-12-15",
    time: "10:00 AM",
    location: "Main Lab, Building A",
    attendees: 25,
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Quantum Hackathon 2024",
    description: "48-hour hackathon focused on building quantum applications. Prizes for best projects! Teams of 3-6 members.",
    type: "hackathon",
    date: "2024-12-20",
    time: "9:00 AM",
    location: "Innovation Hub",
    attendees: 45,
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Lab Visit: IBM Quantum Lab",
    description: "Exclusive tour of IBM's quantum computing facility. Limited spots available. Application required.",
    type: "trip",
    date: "2025-01-10",
    time: "All Day",
    location: "IBM Research, Yorktown Heights",
    attendees: 15,
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Guest Lecture: Quantum Error Correction",
    description: "Dr. John Smith from MIT will discuss recent advances in quantum error correction and fault-tolerant computing.",
    type: "lecture",
    date: "2024-12-08",
    time: "3:00 PM",
    location: "Auditorium, Building B",
    attendees: 60,
    image: "/placeholder.svg",
  },
]

export const messages = [
  {
    id: 1,
    user: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg",
    },
    lastMessage: "Hey! Are you coming to the workshop tomorrow?",
    timestamp: "2h",
    unread: 2,
  },
  {
    id: 2,
    user: {
      name: "Mike Rodriguez",
      avatar: "/placeholder.svg",
    },
    lastMessage: "Thanks for sharing that paper on quantum error correction!",
    timestamp: "5h",
    unread: 0,
  },
  {
    id: 3,
    user: {
      name: "Emma Watson",
      avatar: "/placeholder.svg",
    },
    lastMessage: "Let's meet up to discuss the hackathon project",
    timestamp: "1d",
    unread: 1,
  },
]

export const notifications = [
  {
    id: 1,
    type: "like",
    user: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg",
    },
    content: "liked your post",
    read: false,
  },
  {
    id: 2,
    type: "reply",
    user: {
      name: "Mike Rodriguez",
      avatar: "/placeholder.svg",
    },
    content: "replied to your comment",
    read: false,
  },
  {
    id: 3,
    type: "event",
    content: "Quantum Computing Workshop starts in 2 days",
    read: true,
  },
  {
    id: 4,
    type: "announcement",
    content: "New hackathon registration is now open!",
    read: false,
  },
  {
    id: 5,
    type: "dm",
    user: {
      name: "Emma Watson",
      avatar: "/placeholder.svg",
    },
    content: "sent you a message",
    read: false,
  },
]

