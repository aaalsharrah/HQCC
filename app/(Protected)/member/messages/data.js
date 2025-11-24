// app/messages/data.js

export const conversations = [
  {
    id: 1,
    name: 'Sarah Chen',
    username: '@sarahchen',
    avatar: '/quantum-computing-student.jpg',
    lastMessage: 'Did you see the latest quantum algorithm paper?',
    timestamp: '2m',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Marcus Rodriguez',
    username: '@marcusr',
    avatar: '/latino-man-engineer.jpg',
    lastMessage: 'Let’s schedule the hackathon meeting',
    timestamp: '15m',
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: 'Dr. Emily Watson',
    username: '@emilyw',
    avatar: '/asian-woman-scientist.png',
    lastMessage: 'Great presentation today!',
    timestamp: '1h',
    unread: 1,
    online: false,
  },
  {
    id: 4,
    name: 'James Park',
    username: '@jamespark',
    avatar: '/asian-man-computer-science.jpg',
    lastMessage: 'Thanks for the Qiskit tutorial',
    timestamp: '3h',
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: 'Abdallah Aisharrah',
    username: '@abdallaha',
    avatar: '/visionary-leader.png',
    lastMessage: 'Welcome to HQCC!',
    timestamp: '1d',
    unread: 0,
    online: true,
  },
];

// Each key is a conversation id → its own message history
export const messagesByConversation = {
  1: [
    {
      id: 1,
      sender: 'them',
      content: 'Hey! Did you see the latest quantum algorithm paper from IBM?',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      sender: 'me',
      content:
        'Yes! The new approach to error correction is fascinating. What did you think about it?',
      timestamp: '10:32 AM',
    },
    {
      id: 3,
      sender: 'them',
      content:
        'I loved how they optimized the qubit topology. We should definitely discuss this at the next meeting.',
      timestamp: '10:33 AM',
    },
    {
      id: 4,
      sender: 'me',
      content:
        "I'm preparing some notes on potential applications for our projects.",
      timestamp: '10:35 AM',
    },
    {
      id: 5,
      sender: 'them',
      content:
        "Perfect! Can't wait to hear your thoughts. Are you coming to the lab tour on Friday?",
      timestamp: '10:36 AM',
    },
  ],
  2: [
    {
      id: 1,
      sender: 'them',
      content: 'Yo! We still on for the hackathon planning meeting?',
      timestamp: '9:00 AM',
    },
    {
      id: 2,
      sender: 'me',
      content: 'Yeah, let’s do 6pm in the CS lab.',
      timestamp: '9:05 AM',
    },
    {
      id: 3,
      sender: 'them',
      content: 'Perfect, I’ll bring the slides draft.',
      timestamp: '9:06 AM',
    },
  ],
  3: [
    {
      id: 1,
      sender: 'them',
      content:
        'Great presentation today! The QAOA slide was especially strong.',
      timestamp: '2:15 PM',
    },
    {
      id: 2,
      sender: 'me',
      content:
        'Thank you so much! I’ll polish the explanation for the next talk.',
      timestamp: '2:18 PM',
    },
  ],
  4: [
    {
      id: 1,
      sender: 'them',
      content: 'Thanks for the Qiskit tutorial earlier 🙏',
      timestamp: '7:30 PM',
    },
    {
      id: 2,
      sender: 'me',
      content: 'Anytime! Let me know when you want to go over circuits again.',
      timestamp: '7:33 PM',
    },
  ],
  5: [
    {
      id: 1,
      sender: 'them',
      content: 'Welcome to HQCC! Super excited to have you on board.',
      timestamp: 'Yesterday',
    },
    {
      id: 2,
      sender: 'me',
      content: 'Thank you!! Can’t wait to help build out the quantum projects.',
      timestamp: 'Yesterday',
    },
  ],
};

// Replace messagesByConversation with data from Firestore / Supabase,
// In handleSendMessage, call an API route (/api/messages) to insert into DB,
// Use useEffect + onSnapshot (Firestore) or RLS + subscriptions (Supabase) for live updates.
