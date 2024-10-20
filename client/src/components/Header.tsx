import NavMenu from "@/components/NavMenu";
import Notifications, { NotificationsList } from "@/components/Notifications";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserSearch from "@/components/UserSearch";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  useAcceptFriendRequestMutation,
  useGetNotificationsQuery,
} from "@/store/api/userApi";
import { setChatType } from "@/store/slices/miscSlice";
import { ChatType, UserProfile } from "@/types/types";
import { AnimatePresence } from "framer-motion";
import { Menu, Search } from "lucide-react";
import { useCallback, useState } from "react";
import UserProfilePanel from "./UserProfilePanel";
import { incrementNotificationCount, setNewMessagesAlert, setSelectedChatItem } from "@/store/slices/chatSlice";
import { NEW_MESSAGE_ALERT, NEW_REQUEST } from "@/constants/socketEvents";
import useSocketEvents from "@/hooks/socket";
import { useSocket } from "@/Socket";
import toast from "react-hot-toast";
const Header = () => {
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const socket = useSocket();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isMobile } = useAppSelector((state) => state.misc);
  const { chatType } = useAppSelector((state) => state.misc);

  const { isLoading: isNotificationsLoading, data: notificationsData } =
    useGetNotificationsQuery({});
  const [acceptFriendRequest] = useAcceptFriendRequestMutation()
  const dispatch = useAppDispatch();
  const handleChatTypeChange = (type: ChatType) => {
    dispatch(setChatType(type));
    dispatch(setSelectedChatItem(false));
  };

  const handleFriendRequest = async (userId: string, action: boolean) => {
    // dispatch(setIsNotification(false));
    try {
      const respose = await acceptFriendRequest({
        requestId: userId,
        accept: action,
      });

      if(respose.data.success) {
        toast.success('Friend request accepted!');
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };


  const newRequestHandler = useCallback(() => {
    dispatch(incrementNotificationCount());
  },[])

const eventHandlers = {
  [NEW_REQUEST]: newRequestHandler
}

useSocketEvents(socket, eventHandlers)

  return (
    <>
      <header className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
        <h1 className="text-2xl font-bold">TalkieTalk</h1>
        <div className="flex items-center space-x-4">
          <div className="hidden space-x-2 md:flex">
            <NavMenu
              handleChatTypeChange={handleChatTypeChange}
              chatType={chatType}
              setIsUserProfileOpen={setIsUserProfileOpen}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {isMobile ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit min-w-80 max-w-96">
                      <UserSearch />
                    </PopoverContent>
                  </Popover>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Search Users</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {!isNotificationsLoading && (
            <Notifications
              data={notificationsData.allRequests}
              handleFriendRequest={handleFriendRequest}
              isMobile={isMobile}
              setIsNotificationsOpen={setIsNotificationsOpen}
            />
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetClose asChild>
                <nav className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2 md:hidden">
                    <NavMenu
                      handleChatTypeChange={handleChatTypeChange}
                      chatType={chatType}
                      setIsUserProfileOpen={setIsUserProfileOpen}
                    />
                  </div>
                </nav>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="h-full w-full">
          <SheetHeader>
            <SheetTitle>Search Users</SheetTitle>
          </SheetHeader>
          {/* <UserSearch /> */}
        </SheetContent>
      </Sheet>
      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent side="top" className="h-full w-full">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          {!isNotificationsLoading && (
            <NotificationsList
              data={notificationsData.allRequests}
              handleFriendRequest={handleFriendRequest}
            />
          )}
        </SheetContent>
      </Sheet>
      <AnimatePresence>
        {isUserProfileOpen && (
          <UserProfilePanel
            // isOpen={isUserProfileOpen}
            onClose={() => setIsUserProfileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
