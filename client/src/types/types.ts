export type ChatType = "all" | "group";

export type FriendRequest = {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profilePic: string;
  };
};

export type UserProfile = {
  name: string;
  profilePic?: {
    public_id: string;
    url: string;
  };
  userName: string;
};
