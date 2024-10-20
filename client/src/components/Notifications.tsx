import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FriendRequest } from "@/types/types";
import { Bell } from "lucide-react";
import ProfileText from "@/components/common/ProfileText";
import { useAppSelector } from "@/hooks";

export const NotificationsList = ({
  data,
  handleFriendRequest,
}: {
  data: FriendRequest[];
  handleFriendRequest: (userId: string, action: boolean) => void;
}) => (
  <div className="space-y-4">
    <ScrollArea className="h-[300px]">
      {data.map((request) => (
        <div key={request._id} className="flex items-center gap-2 py-2">
          <ProfileText
            avatar={request.sender.profilePic}
            primaryText={request.sender.name}
            secondaryText={"Sent you a friend request"}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleFriendRequest(request._id, true)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFriendRequest(request._id, false)}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </ScrollArea>
  </div>
);

const Notifications = ({
  data,
  handleFriendRequest,
  isMobile,
  setIsNotificationsOpen,
}: {
  data: FriendRequest[];
  handleFriendRequest: (userId: string, action: boolean) => void;
  isMobile: boolean;
  setIsNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {notificationCount} = useAppSelector((state) => state.chat);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 px-2 py-1 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 px-2 py-1 text-xs"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                {data.length > 0 ? (
                  <NotificationsList
                    data={data}
                    handleFriendRequest={handleFriendRequest}
                  />
                ) : (
                  <ScrollArea className="text-center text-black/50">
                    0 notifications
                  </ScrollArea>
                )}
              </PopoverContent>
            </Popover>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Notifications;
