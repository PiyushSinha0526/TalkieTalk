export type ChatType = "all" | "group";

export type FriendRequest = {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profilePic: string;
  };
};
export type FriendProps = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastSeen: string;
};

export type MessageProps = {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
};

export interface ChatWindowProps {
  selectedChatItem: {
    _id: string;
    profilePic: string[];
    name: string;
    creater: string;
    groupChat: boolean;
  };
}

export type ChatItemProps = {
  _id: string;
  name: string;
  profilePic: string[];
  groupChat: boolean;
  creater: string;
  // lastMessage: string;
  // lastSeen: string;
  members?: string[];
};

export type Message = {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
  type: "text" | "attachment";
  attachmentUrl?: string;
};

export type UserProfile = {
  name: string;
  profilePic?: {
    public_id: string;
    url: string;
  };
  userName: string;
};

