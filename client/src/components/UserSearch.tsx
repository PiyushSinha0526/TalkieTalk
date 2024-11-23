import { useEffect, useState } from "react";
import {
  useLazyUserSearchQuery,
  useSendFriendRequestMutation,
} from "@/store/api/userApi";
import useDebounce from "@/hooks/debounce";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProfileText from "./common/ProfileText";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUser, { data, isLoading }] = useLazyUserSearchQuery();
  const [sendFriendRequest] = useSendFriendRequestMutation();
  const debouncedQuery = useDebounce(searchQuery, 1000);

  useEffect(() => {
    searchUser(debouncedQuery || "");
  }, [debouncedQuery, searchUser]);
  const handleSendFriendRequest = async (id: string) => {
    try {
      const response = await sendFriendRequest({ userId: id });
      if (!!response?.error) {
        const errorData = (
          response.error as FetchBaseQueryError & {
            data: {
              success: boolean;
              message: string;
            };
          }
        ).data;

        toast.error(errorData.message);
      }
      if (response.data.success) {
        toast.success("Friend request sent!");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };
  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ScrollArea className="max-h-[300px] min-h-[50px]">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {data && data?.users.length === 0 && (
              <div className="w-full text-center text-black/50">
                no user found.
              </div>
            )}
            {data &&
              data?.users?.map((user: any) => (
                <div key={user.id} className="flex items-center gap-2 py-2">
                  <ProfileText
                    avatar={user.avatar}
                    primaryText={user.name}
                    secondaryText={user.userName}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSendFriendRequest(user._id)}
                  >
                    Add Friend
                  </Button>
                </div>
              ))}
          </>
        )}
      </ScrollArea>
    </div>
  );
};

export default UserSearch;
