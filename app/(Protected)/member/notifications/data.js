// app/notifications/data.js

import {
  Heart,
  MessageCircle,
  Users,
  Calendar,
  UserPlus,
  Repeat2,
  Mail,
    case "repost":
      return <Repeat2 className="h-5 w-5 text-accent" />;
    default:
      return null;
  }
};

// ----------------------------
// NOTIFICATIONS DATA
// ----------------------------
export const notificationsData = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Sarah Chen",
      username: "sarahchen",
      avatar: "/asian-woman-scientist.png",
    },
    content: "liked your post",
    timestamp: "2m ago",
    read: false,
    postPreview:
      "Just finished implementing Grover's algorithm! The speedup is incredible...",
  },
  {
    id: "2",
    type: "follow",
    user: {
      name: "Marcus Johnson",
      username: "marcusj",
      avatar: "/black-man-engineer.jpg",
    },
    content: "started following you",
    timestamp: "15m ago",
    read: false,
  },
  {
    id: "3",
    type: "comment",
    user: {
      name: "Emily Rodriguez",
      username: "emilyrodriguez",
      avatar: "/latina-woman-physicist.jpg",
    },
    content: "commented on your post",
    timestamp: "1h ago",
    read: false,
    postPreview:
      "Great explanation! Have you considered using variational quantum algorithms?",
  },
  {
    id: "4",
    type: "mention",
    user: {
      name: "David Kim",
      username: "davidkim",
      avatar: "/asian-man-student.png",
    },
    content: "mentioned you in a post",
    timestamp: "2h ago",
    read: true,
    postPreview:
      "Thanks @sarahjohnson for the quantum entanglement resources!",
  },
  {
    id: "5",
    type: "event",
    user: {
      name: "HQCC Events",
      username: "hqcc",
      avatar: "/quantum-computing-logo.jpg",
    },
    content: "Quantum Hackathon starts in 2 days",
    timestamp: "3h ago",
    read: true,
  },
  {
    id: "6",
    type: "repost",
    user: {
      name: "Alex Thompson",
      username: "alexthompson",
      avatar: "/person-technology.jpg",
    },
    content: "reposted your post",
    timestamp: "5h ago",
    read: true,
    postPreview:
      "Check out this amazing quantum computing visualization tool I built!",
  },
  {
    id: "7",
    type: "like",
    user: {
      name: "Jessica Park",
      username: "jessicapark",
      avatar: "/woman-scientist.png",
    },
    content: "liked your comment",
    timestamp: "1d ago",
    read: true,
    postPreview:
      "I think the decoherence time could be improved with better error correction...",
  },
  {
    id: "8",
    type: "follow",
    user: {
      name: "Michael Brown",
      username: "michaelbrown",
      avatar: "/man-engineer.png",
    },
    content: "started following you",
    timestamp: "2d ago",
    read: true,
  },
];
