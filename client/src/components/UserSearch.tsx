import { useEffect, useState } from "react";
import {
  useLazyUserSearchQuery,
  useSendFriendRequestMutation,
} from "@/store/api/userApi";
import useDebounce from "@/hooks/debounce";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProfileText from "@/components/ProfileText";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useAppSelector } from "@/hooks";

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUser, { data, isLoading }] = useLazyUserSearchQuery();
  const [sendFriendRequest] = useSendFriendRequestMutation();
  const debouncedQuery = useDebounce(searchQuery, 1000);
  const { isMobile } = useAppSelector((state) => state.misc);

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
      <ScrollArea
        className={`flex-1 ${isMobile ? "h-[calc(100vh-200px)]" : "h-[300px]"}`}
      >
        <div className="p-4 pl-0">
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
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserSearch;
