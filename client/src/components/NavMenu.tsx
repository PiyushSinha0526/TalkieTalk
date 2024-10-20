import { Button } from "@/components/ui/button";
import { ChatType } from "@/types/types";
import { MessageSquare, UserCircle, Users } from "lucide-react";

const NavMenu = ({
  handleChatTypeChange,
  chatType,
  setIsUserProfileOpen,
}: {
  handleChatTypeChange: (chatType: ChatType) => void;
  chatType: ChatType;
  setIsUserProfileOpen: (isOpen: boolean) => void;
}) => {
  return (
    <>
      <Button
        variant="ghost"
        className={`w-full justify-start ${chatType === "all" ? "bg-accent text-accent-foreground" : ""}`}
        onClick={() => handleChatTypeChange("all")}
      >
        <MessageSquare className="h-4 w-4" />
        All Chats
      </Button>
      <Button
        variant="ghost"
        className={`w-full justify-start ${chatType === "group" ? "bg-accent text-accent-foreground" : ""}`}
        onClick={() => handleChatTypeChange("group")}
      >
        <Users className="h-4 w-4" />
        My Groups
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setIsUserProfileOpen(true)}
      >
        <UserCircle className="h-4 w-4" />
        My Profile
      </Button>
    </>
  );
};

export default NavMenu;
