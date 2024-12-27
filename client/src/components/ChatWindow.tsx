import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizablePanel } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} from "@/constants/socketEvents";
import { useAppDispatch, useAppSelector } from "@/hooks";
import useSocketEvents from "@/hooks/socket";
import { useSocket } from "@/Socket";
import { useChatDetailsQuery, useGetMessagesQuery } from "@/store/api/chatApi";
import { removeNewMessagesAlert } from "@/store/slices/chatSlice";
import { setIsFileMenuOpen, setIsProfileOpen } from "@/store/slices/miscSlice";
import { ChatWindowProps, Message } from "@/types/types";
import { skipToken } from "@reduxjs/toolkit/query";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Send, Smile } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import FileMenu from "./common/FileMenu";
import MessageWithAttachments from "./common/MessageAttachments";
import ProfilePanel from "./ProfilePanel";
import EmojiPicker from "emoji-picker-react";

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedChatItem }) => {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const { isProfileOpen, isMobile } = useAppSelector((state) => state.misc);
  const { userAuth } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messagesChunk, isFetching } = useGetMessagesQuery(
    selectedChatItem ? { chatId: selectedChatItem._id, page } : skipToken,
  );

  const { data: chatDetails, isSuccess: successMember } = useChatDetailsQuery(
    selectedChatItem._id
      ? { chatId: selectedChatItem._id, populate: true }
      : skipToken,
    { skip: !selectedChatItem._id },
  );

  useEffect(() => {
    if (successMember && chatDetails?.chat?.members) {
      setGroupMembers(chatDetails.chat.members);
    }
  }, [chatDetails, successMember]);

  useEffect(() => {
    dispatch(removeNewMessagesAlert(selectedChatItem._id));
    return () => {
      if (selectedChatItem._id) {
        setAllMessages([]);
        setPage(1);
        setNewMessage("");
      }
    };
  }, [selectedChatItem._id]);

  useEffect(() => {
    if (messagesChunk?.messages) {
      setAllMessages((prevMessages) => [
        ...messagesChunk.messages,
        ...prevMessages,
      ]);
    }
  }, [messagesChunk]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollableElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollableElement instanceof HTMLElement) {
        scrollableElement.scrollTop = scrollableElement.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, page]);

  const handleScroll = useCallback(() => {
    const scrollableElement = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (
      scrollableElement instanceof HTMLElement &&
      scrollableElement.scrollTop < 50 &&
      !isFetching &&
      messagesChunk?.totalPages > page
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [isFetching]);

  useEffect(() => {
    const scrollableElement = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollableElement) {
      scrollableElement.addEventListener("scroll", handleScroll);
      return () =>
        scrollableElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const button = document.querySelector(".emoji-picker-button");
      const picker = document.querySelector(".emoji-picker-dropdown");

      if (
        picker &&
        !picker.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (selectedChatItem._id) {
      socket?.emit(NEW_MESSAGE, {
        chatId: selectedChatItem._id,
        members: groupMembers.map((member: any) => member._id),
        messages: newMessage,
      });
      scrollToBottom();
    } else {
      console.error("No chat selected");
    }
    setNewMessage("");
  };

  const NewMessageListener = useCallback(
    (data: any) => {
      if (selectedChatItem._id !== data.chatId) return;
      setAllMessages((prev) => [...prev, data.message]);
      scrollToBottom();
    },
    [selectedChatItem._id],
  );

  const startTypingListener = useCallback(
    (data: any) => {
      if (selectedChatItem._id !== data.chatId) return;
      setIsSomeoneTyping(true);
    },
    [selectedChatItem._id],
  );

  const stopTypingListener = useCallback(
    (data: any) => {
      if (selectedChatItem._id !== data.chatId) return;
      setIsSomeoneTyping(false);
    },
    [selectedChatItem._id],
  );

  const eventHandlers = {
    [NEW_MESSAGE]: NewMessageListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };

  useSocketEvents(socket, eventHandlers);

  const handleFileOpen = () => {
    dispatch(setIsFileMenuOpen(true));
  };

  const messageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      socket?.emit(START_TYPING, {
        members: groupMembers.map((member: any) => member._id),
        chatId: selectedChatItem._id,
      });
      setIsTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit(STOP_TYPING, {
        members: groupMembers.map((member: any) => member._id),
        chatId: selectedChatItem._id,
      });
      setIsTyping(false);
    }, 2000);
  };
  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  return (
    <ResizablePanel
      className={`${isMobile && !selectedChatItem ? "hidden" : ""} bg-card`}
    >
      {selectedChatItem && selectedChatItem?._id ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-4 border-b p-4">
            <Avatar>
              <AvatarImage
                src={selectedChatItem.profilePic[0]}
                alt={selectedChatItem.name}
              />
              <AvatarFallback>{selectedChatItem.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Button
                variant="link"
                className="h-auto p-0 text-xl font-semibold"
                onClick={() => dispatch(setIsProfileOpen(true))}
              >
                {selectedChatItem.name}
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div>
              {messagesChunk &&
                [...allMessages].map((message: any) => (
                  <motion.div
                    key={message._id}
                    className={`mb-4 flex ${
                      message.sender._id === userAuth?._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`min-w-32 max-w-[70%] rounded-lg ${
                        message.sender_id === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent"
                      }`}
                    >
                      <div className="px-2 py-1 text-base font-semibold text-black/50 underline underline-offset-2">
                        {message.sender.name}
                      </div>
                      <MessageWithAttachments message={message} />
                      <div className="mt-1 px-2 py-1 text-right text-xs font-normal opacity-70">
                        <span className="font-semibold">
                          {moment(message.createdAt).local().format("MMM DD, ")}
                        </span>
                        {moment(message.createdAt).local().format("YYYY ")}
                        <span className="font-semibold">
                          {moment(message.createdAt).local().format("hh:mm ")}
                        </span>
                        {moment(message.createdAt).local().format("A")}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </ScrollArea>
          {isSomeoneTyping && (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              Someone is typing...
            </div>
          )}
          <div className="border-t p-4">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="emoji-picker-button relative"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPicker(!showPicker);
                }}
              >
                <Smile className="h-5 w-5" />
                <span className="sr-only">Add emoji</span>
                {showPicker && (
                  <span
                    className={`emoji-picker-dropdown absolute -right-48 bottom-full mt-2 flex w-[185px] flex-col rounded-md border bg-background p-2 shadow-md`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleFileOpen}
              >
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
                <FileMenu chatId={selectedChatItem?._id} />
                <input type="file" ref={fileInputRef} className="hidden" />
              </Button>
              <Input
                placeholder="Type a message"
                value={newMessage}
                onChange={messageHandler}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Select a chat to start messaging
        </div>
      )}
      <AnimatePresence>
        {selectedChatItem && userAuth && isProfileOpen && (
          <ProfilePanel
            onClose={() => dispatch(setIsProfileOpen(false))}
            chatItem={selectedChatItem}
            isCreatorId={selectedChatItem.creater}
            groupMembers={groupMembers}
            setGroupMembers={setGroupMembers}
            chatName={chatDetails?.chat?.name}
          />
        )}
      </AnimatePresence>
    </ResizablePanel>
  );
};

export default ChatWindow;
