import { ChatItemProps, Message, UserProfile } from "@/types/types";

const chatItems: ChatItemProps[] = [
  {
    id: "1",
    name: "Alice",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
  {
    id: "2",
    name: "Bob",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
  {
    id: "3",
    name: "Charlie",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
  {
    id: "4",
    name: "Project Team",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
  {
    id: "5",
    name: "Family Group",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
];

const messages: Message[] = [
  {
    id: 1,
    senderId: 1,
    text: "Hey, how are you?",
    timestamp: "10:00 AM",
    type: "text",
  },
  {
    id: 2,
    senderId: 0,
    text: "I'm good, thanks! How about you?",
    timestamp: "10:02 AM",
    type: "text",
  },
  {
    id: 3,
    senderId: 1,
    text: "Doing well. Want to grab lunch later?",
    timestamp: "10:05 AM",
    type: "text",
  },
  {
    id: 4,
    senderId: 0,
    text: "Sure, that sounds great!",
    timestamp: "10:07 AM",
    type: "text",
  },
  {
    id: 5,
    senderId: 1,
    text: "document.pdf",
    timestamp: "10:10 AM",
    type: "attachment",
    attachmentUrl: "/placeholder.svg?height=64&width=64",
  },
];

const allUsers: UserProfile[] = [
  {
    id: 0,
    name: "You",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    email: "you@example.com",
    status: "Online",
  },
  {
    id: 1,
    name: "Alice",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    email: "alice@example.com",
    status: "Available",
  },
  {
    id: 2,
    name: "Bob",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    email: "bob@example.com",
    status: "Busy",
  },
  {
    id: 3,
    name: "Charlie",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    email: "charlie@example.com",
    status: "Away",
  },
  {
    id: 4,
    name: "David",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    email: "david@example.com",
    status: "Available",
  },
  {
    id: 5,
    name: "Eve",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    email: "eve@example.com",
    status: "Offline",
  },
];

export { chatItems, messages, allUsers };
