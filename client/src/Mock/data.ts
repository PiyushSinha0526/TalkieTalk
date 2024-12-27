import { ChatItemProps, Message } from "@/types/types";

const chatItems: ChatItemProps[] = [
  {
    _id: "1",
    name: "Alice",
    creater: "Alice",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
  {
    _id: "2",
    name: "Bob",
    creater: "Bob",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
  {
    _id: "3",
    name: "Charlie",
    creater: "Bob",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
  {
    _id: "4",
    name: "Project Team",
    creater: "Bob",
    profilePic: ["/placeholder.svg?height=32&width=32"],
    groupChat: true,
    members: [],
  },
  {
    _id: "5",
    name: "Family Group",
    creater: "Bob",
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

export { chatItems, messages };
