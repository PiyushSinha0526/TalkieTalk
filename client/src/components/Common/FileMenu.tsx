import { useAppSelector, useAppDispatch } from "@/hooks";
import React, { useRef, useEffect, useState } from "react";
import {
  FileAudio2,
  FileVideo,
  FileText,
  Image,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast, { Toaster } from "react-hot-toast";
import { setIsFileMenuOpen } from "@/store/slices/miscSlice";
import { useSendAttachmentsMutation } from "@/store/api/chatApi";

const fileTypes = {
  audio: [".mp3", ".wav", ".ogg", ".m4a"],
  video: [".mp4", ".webm", ".ogg", ".mov"],
  document: [".pdf", ".doc", ".docx", ".txt"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
};

const fileSizeLimits = {
  video: 30 * 1024 * 1024, // 30MB in bytes
  audio: 15 * 1024 * 1024, // 15MB in bytes
  document: 15 * 1024 * 1024, // 15MB in bytes
  image: 15 * 1024 * 1024, // 15MB in bytes
};

type FileItem = {
  name: string;
  type: keyof typeof fileTypes;
  file: File;
};

export default function FileMenu({ chatId }: { chatId: string }) {
  const { isFileMenuOpen } = useAppSelector((state) => state.misc);
  const dispatch = useAppDispatch();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");
  const [sendAttachments] = useSendAttachmentsMutation();
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        dispatch(setIsFileMenuOpen(false));
      }
    }

    function updateMenuPosition() {
      if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setMenuPosition(spaceBelow >= spaceAbove ? "bottom" : "top");
      }
    }

    if (isFileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updateMenuPosition);
      updateMenuPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [isFileMenuOpen, dispatch, selectedFiles]);

  if (!isFileMenuOpen) return null;

  const handleFileSelect = (fileType: keyof typeof fileTypes) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = fileTypes[fileType].join(",");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const fileType = Object.keys(fileTypes).find((type) =>
      fileTypes[type as keyof typeof fileTypes].includes(fileExtension),
    ) as keyof typeof fileTypes | undefined;

    if (fileType && selectedFiles.length < 5) {
      if (file.size <= fileSizeLimits[fileType]) {
        setSelectedFiles((prev) => [
          ...prev,
          { name: file.name, type: fileType, file },
        ]);
        toast.success(
          `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} file added successfully`,
        );
      } else {
        const sizeLimit = fileSizeLimits[fileType] / (1024 * 1024);
        toast.error(
          `File size exceeds the limit of ${sizeLimit}MB for ${fileType} files.`,
        );
      }
    } else if (!fileType) {
      toast.error(
        `Invalid file type. Please select a valid audio, video, document, or image file.`,
      );
    } else {
      toast.error(`You can only add up to 5 files.`);
    }

    // Reset the file input
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: keyof typeof fileTypes) => {
    switch (type) {
      case "audio":
        return <FileAudio2 className="h-4 w-4" />;
      case "video":
        return <FileVideo className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }
    setIsUploading(true);

    try {
      const myForm = new FormData();

      myForm.append("chatId", chatId);
      selectedFiles.forEach((x) => myForm.append("files", x.file));
      const res = await sendAttachments(myForm);

      if (res.data) toast.success("Files uploaded successfully!");
      setSelectedFiles([]);
    } catch (error) {
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      ref={menuRef}
      className={`absolute -right-48 ${menuPosition === "bottom" ? "top-full" : "bottom-full"} mt-2 flex w-[185px] flex-col rounded-md border bg-background p-2 shadow-md`}
      style={{ maxHeight: "calc(100vh - 8rem)" }}
    >
      <TooltipProvider>
        <div className="flex space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Audio File"
                onClick={() => handleFileSelect("audio")}
              >
                <FileAudio2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Audio File (Max 15MB)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Video File"
                onClick={() => handleFileSelect("video")}
              >
                <FileVideo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Video File (Max 30MB)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Document File"
                onClick={() => handleFileSelect("document")}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Document File (Max 15MB)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Image File"
                onClick={() => handleFileSelect("image")}
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Image File (Max 15MB)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <ScrollArea className="flex-grow">
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex w-full items-center justify-between"
            >
              <span className="flex items-center space-x-2 truncate">
                {getFileIcon(file.type)}
                <span className="truncate">{file.name}</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </ScrollArea>

      {selectedFiles.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-2 w-full"
        >
          {isUploading ? "Uploading..." : "Upload Files"}
          {!isUploading && <Upload className="ml-2 h-4 w-4" />}
        </Button>
      )}

      <Toaster />
    </div>
  );
}
