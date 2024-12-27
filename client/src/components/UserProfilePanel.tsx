import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useEditProfileMutation } from "@/store/api/authApi";
import { setUser } from "@/store/slices/authSlice";
import { UserProfile } from "@/types/types";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const UserProfilePanel = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useAppDispatch();
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const { userAuth } = useAppSelector((state) => state.auth);
  const [editProfile, { isLoading }] =
    useEditProfileMutation();

  useEffect(() => {
    if (!userAuth) return;
    const { name, userName, profilePic } = userAuth;
    setUserProfile({ name, userName, profilePic });
  }, [userAuth]);

  const handleSave = async () => {
    const response = await editProfile({
      userName: userProfile?.userName,
    });

    if (response.data.success) {
      setUserProfile(userProfile);
      dispatch(setUser(userProfile));
      onClose();
      toast.success("Group name updated successfully!");
    }
  };
  if (!userAuth) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-semibold">My Profile</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      {userProfile && <ScrollArea className="h-[calc(100vh-64px)] p-4">
        <div className="mx-auto flex max-w-md flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={userProfile.profilePic?.url}
              alt={userProfile.name}
            />
            <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
          </Avatar>
          <Input
            placeholder="Name"
            value={userProfile.name}
            disabled
            onChange={(e) =>
              setUserProfile({ ...userProfile, name: e.target.value })
            }
          />
          <Input
            placeholder="username"
            value={userProfile.userName}
            onChange={(e) =>
              setUserProfile({ ...userProfile, userName: e.target.value })
            }
          />
          {/* <Input
            placeholder="Status"
            value={userProfile.status}
            onChange={(e) =>
              setUserProfile({ ...userProfile, status: e.target.value })
            }
          /> */}
          <Button
            onClick={handleSave}
            className="w-full"
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </ScrollArea>}
    </motion.div>
  );
};

export default UserProfilePanel;
