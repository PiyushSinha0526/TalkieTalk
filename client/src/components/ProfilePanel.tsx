"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/hooks";
import useDebounce from "@/hooks/debounce";
import {
  useAddGroupMembersMutation,
  useDeleteChatMutation,
  useLeaveGroupMutation,
  useRemoveGroupMemberMutation,
  useRenameGroupMutation,
} from "@/store/api/chatApi";
import { useAvailableFriendsQuery } from "@/store/api/userApi";
import { setSelectedChatItem } from "@/store/slices/chatSlice";
import { ChatItemProps } from "@/types/types";
import { skipToken } from "@reduxjs/toolkit/query";
import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePanel({
  onClose,
  chatItem,
  isCreatorId,
  groupMembers,
  setGroupMembers,
  chatName,
}: {
  onClose: () => void;
  chatItem: ChatItemProps;
  isCreatorId: string | null;
  groupMembers: any[];
  setGroupMembers: any;
  chatName: string;
}) {
  const dispatch = useAppDispatch();
  const [addMembers] = useAddGroupMembersMutation();
  const [removeGroupMember] = useRemoveGroupMemberMutation();
  const [leaveGroup] = useLeaveGroupMutation();
  const [deleteGroup] = useDeleteChatMutation();
  const { userAuth } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(chatName);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filteredFriends, setFilteredFriends] = useState<any[]>([]);
  const creator = isCreatorId == userAuth?._id;

  const { isLoading, data, isSuccess } = useAvailableFriendsQuery(
    chatItem._id ? chatItem._id : skipToken,
  );
  const [renameGroup, { isLoading: isLoadingGroupName }] =
    useRenameGroupMutation();
  useEffect(() => {
    if (isSuccess && data?.friends) {
      const ffdata = data.friends.filter(
        (friend: any) =>
          !groupMembers.some((member: any) => member._id === friend._id) &&
          (friend.name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
            friend.userName
              ?.toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())),
      );
      setFilteredFriends(ffdata || []);
    } else {
      setFilteredFriends([]);
    }
  }, [isSuccess, data, debouncedSearchQuery]);

  const handleGroupNameEdit = async () => {
    // In a real app, you'd update the group name here
    const response = await renameGroup({
      chatId: chatItem._id,
      name: newGroupName,
    });

    if (response.data.success) {
      dispatch(setSelectedChatItem({ ...chatItem, name: newGroupName }));
      setEditingName(false);
      toast.success("Group name updated successfully!");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app, you'd update the group picture here
        console.log("Updating group picture to:", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const addMember = async (memberId: string, friendName: string) => {
    try {
      const members = [memberId];
      const chatId = chatItem._id;
      const response = await addMembers({ members, chatId });
      if (response.data.success) {
        // Update the group members directly
        setGroupMembers((prev: any) => [
          ...prev,
          filteredFriends.find((friend: any) => friend._id === memberId),
        ]);

        // Remove the added member from filteredFriends
        setFilteredFriends((prev) =>
          prev.filter((friend: any) => friend._id !== memberId),
        );
        toast.success(`${friendName} added to group successfully!`);
      } else {
        console.error("Failed to add member:", response.error);
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };
  const removeGroupMemberHandler = async (member: any) => {
    try {
      const chatId = chatItem._id;
      const response = await removeGroupMember({ userId: member._id, chatId });
      if (response.data.success) {
        // Update group members
        setGroupMembers((prev: any) =>
          prev.filter((m: any) => m._id !== member._id),
        );

        // Add removed member back to filteredFriends dynamically
        setFilteredFriends((prev) => {
          if (
            member.name
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            member.userName
              ?.toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
          ) {
            return [...prev, member];
          }
          return prev;
        });

        toast.success(`${member.name} removed from group successfully!`);
      } else {
        toast.error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing group member:", error);
    }
  };

  const leaveGroupHandler = async (chatId: string) => {
    try {
      const response = await leaveGroup(chatId);
      if (response.data.success) {
        dispatch(setSelectedChatItem({}));
        onClose();
        toast.success("Left group successfully!");
      } else {
        console.error("Failed to remove member:", response.error);
        toast.error("Failed to leave group");
      }
    } catch (error) {
      console.error("Error removing group member:", error);
    }
  };
  const deleteGroupHandler = async (chatId: string) => {
    try {
      const response = await deleteGroup(chatId);
      if (response.data.success) {
        dispatch(setSelectedChatItem({}));
        onClose();
        toast.success("Group deleted successfully!");
      } else {
        console.error("Failed to delete group:", response.error);
        toast.error("Failed to delete group");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  }
  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t bg-background shadow-lg"
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 500 }}
      style={{ height: "70%" }}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-semibold">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="max-w-xs"
              />
              <Button
                disabled={isLoadingGroupName}
                onClick={handleGroupNameEdit}
              >
                Confirm
              </Button>
            </div>
          ) : (
            chatItem.name
          )}
        </h2>
        <div className="flex items-center gap-2">
          {creator && chatItem.groupChat === true && !editingName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingName(true)}
            >
              Edit Name
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-full p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={chatItem.profilePic[0]} alt={chatItem.name} />
              <AvatarFallback>{chatItem.name[0]}</AvatarFallback>
            </Avatar>
            {creator && chatItem.groupChat === true && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <h3 className="text-2xl font-bold">{chatItem.name}</h3>
          {/* <p className="text-muted-foreground">
            Last seen: {chatItem.lastSeen}
          </p> */}
          {chatItem.groupChat === true && (
            <div className="w-full">
              <h4 className="mb-2 text-lg font-semibold">Group Members</h4>
              {groupMembers.length > 0 &&
                groupMembers.map((member: any) => {
                  // const member = allUsers.find((user) => user.id === x._id)
                  // console.log(x, member);
                  // if (!member) return null
                  return (
                    <div
                      key={member._id}
                      className="mb-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                      {creator && member._id != userAuth?._id && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeGroupMemberHandler(member)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  );
                })}
              {creator && (
                <div className="mt-4">
                  <h5 className="mb-2 font-semibold">Add Members</h5>
                  <Input
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                  {!isLoading &&
                    filteredFriends.length > 0 &&
                    filteredFriends?.map((friend: any) => (
                      <div
                        key={friend._id}
                        className="mb-2 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={friend.avatar}
                              alt={friend.name}
                            />
                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{friend.name}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addMember(friend._id, friend.name)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {chatItem.groupChat === true && (
            <div className="mt-4 flex w-full justify-between">
              {creator ? (
                <Button
                  variant="destructive"
                  onClick={() => deleteGroupHandler(chatItem._id)}
                >
                  Delete Group
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => leaveGroupHandler(chatItem._id)}
                >
                  Leave Group
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
