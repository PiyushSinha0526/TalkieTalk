import ProfileText from "@/components/common/ProfileText";
import { ResizablePanel } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NEW_MESSAGE_ALERT, REFETCH_CHATS } from "@/constants/socketEvents";
import { useAppDispatch, useAppSelector } from "@/hooks";
import useSocketEvents from "@/hooks/socket";
import { useSocket } from "@/Socket";
import { useMyChatsQuery, useMyGroupsQuery } from "@/store/api/chatApi";
import {
  setNewMessagesAlert,
  setSelectedChatItem,
} from "@/store/slices/chatSlice";
import { setLocalValue } from "@/utils/localStorage";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { memo, useCallback, useEffect, useState, useMemo } from "react";
import DialogModel from "@/components/common/Dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const ChatSidebar = memo(() => {
  const socket = useSocket();
  const { isMobile, chatType } = useAppSelector((state) => state.misc);
  const { selectedChatItem, newMessagesAlert } = useAppSelector(
    (state) => state.chat,
  );
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const {
    isLoading: chatItemsLoading,
    data: chatItems,
    refetch: refetchChats,
  } = useMyChatsQuery("", { skip: chatType !== "all" });

  const {
    isLoading: groupItemsLoading,
    data: groupItems,
    refetch: refetchGroups,
  } = useMyGroupsQuery("", { skip: chatType !== "group" });

  const [filteredChatItems, setFilteredChatItems] = useState([]);

  useEffect(() => {
    setLocalValue(NEW_MESSAGE_ALERT, newMessagesAlert);
  }, [newMessagesAlert]);

  useEffect(() => {
    if (!chatItemsLoading && !groupItemsLoading) {
      let chatsData = [];
      if (chatType === "all") {
        chatsData = chatItems?.chats || [];
      } else if (chatType === "group") {
        chatsData = groupItems?.groups || [];
      }
      setFilteredChatItems(chatsData);
    }
  }, [chatType, chatItems, groupItems, chatItemsLoading, groupItemsLoading]);

  const newMessageAlertHandler = useCallback(
    (data: any) => {
      if (selectedChatItem._id === data.chatId) return;
      dispatch(setNewMessagesAlert(data));
    },
    [dispatch, selectedChatItem._id],
  );

  const refetchListener = useCallback(() => {
    if (chatType === "group") {
      refetchGroups();
    } else {
      refetchChats();
    }
  }, [refetchGroups, refetchChats, chatType]);

  const eventHandlers = useMemo(
    () => ({
      [NEW_MESSAGE_ALERT]: newMessageAlertHandler,
      [REFETCH_CHATS]: refetchListener,
    }),
    [newMessageAlertHandler, refetchListener],
  );

  useSocketEvents(socket, eventHandlers);

  const handleChatItemClick = useCallback(
    (chatItem: any) => {
      dispatch(setSelectedChatItem(chatItem));
    },
    [dispatch],
  );

  return (
    <ResizablePanel
      defaultSize={25}
      minSize={20}
      maxSize={40}
      className={`${isMobile && selectedChatItem ? "hidden" : ""} bg-card`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <span className="text-lg font-medium text-black/50">
            <span className="text-xl font-bold capitalize text-black/100 underline underline-offset-4">
              {chatType}
            </span>{" "}
            Chats
          </span>
          {chatType === "group" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  Create <PlusIcon />
                </Button>
              </DialogTrigger>
              <DialogModel setOpen={setOpen} />
            </Dialog>
          )}
        </div>
        <ScrollArea className="flex-1">
          {filteredChatItems.map((chatItem: any) => (
            <motion.div
              key={chatItem._id}
              className={`flex cursor-pointer items-center gap-4 p-4 hover:bg-foreground hover:text-background ${selectedChatItem?._id === chatItem._id ? "bg-accent-foreground text-background" : ""}`}
              onClick={() => handleChatItemClick(chatItem)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {chatItem?.profilePic && (
                <ProfileText
                  avatar={chatItem?.profilePic[0]}
                  primaryText={chatItem?.name}
                />
              )}
              <div className="text-xs text-muted-foreground">
                {
                  newMessagesAlert.find(
                    (item: any) => item.chatId === chatItem._id,
                  )?.count
                }
              </div>
            </motion.div>
          ))}
        </ScrollArea>
      </div>
    </ResizablePanel>
  );
});

export default ChatSidebar;
