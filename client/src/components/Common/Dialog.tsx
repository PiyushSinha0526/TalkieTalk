import React, { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNewGroupMutation } from "@/store/api/chatApi";
import { setSelectedChatItem } from "@/store/slices/chatSlice";
import { useAppDispatch } from "@/hooks";

const DialogModel = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [groupName, setGroupName] = useState<string>("");
  const dispatch = useAppDispatch();
  const [newGroup, { data, isLoading }] = useNewGroupMutation();

  useEffect(() => {
    if (!isLoading && data) {
      dispatch(setSelectedChatItem({ ...data.group, profilePic: [] }));
      setOpen(false);
    }
  }, [isLoading, data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    newGroup({ name: groupName }).unwrap();
  };

  return (
    <>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder=""
              className="col-span-3"
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  );
};

export default DialogModel;
