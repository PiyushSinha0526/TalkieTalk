import React from "react";
import { AudioLines, File, FileText, Video } from "lucide-react";
import { transformImage } from "@/utils/image";

const fileTypes = {
  audio: [".mp3", ".wav", ".ogg", ".m4a"],
  video: [".mp4", ".webm", ".ogg", ".mov"],
  document: [".pdf", ".doc", ".docx", ".txt"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
};

const getFileType = (url: string) => {
  const extension = url.substring(url.lastIndexOf(".")).toLowerCase();
  for (const [type, extensions] of Object.entries(fileTypes)) {
    if (extensions.includes(extension)) {
      return type;
    }
  }
  return "unknown";
};

const getFileName = (url: string) => {
  const parts = url.split("/");
  return parts[parts.length - 1];
};

interface Attachment {
  url: string;
}

interface MessageWithAttachmentsProps {
  message: {
    content: string;
    attachments?: Attachment[];
  };
}

const MessageWithAttachments: React.FC<MessageWithAttachmentsProps> = ({
  message,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      {message.content && <div className="text-base rounded-md px-2 py-1">{message.content}</div>}
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex px-2 h-24 w-36 flex-wrap gap-2 rounded-md">
          {message.attachments.map((attachment, index) => {
            const fileType = getFileType(attachment.url);
            const fileName = getFileName(attachment.url);

            return (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center space-x-2 rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
                aria-label={`Open ${fileName}`}
              >
                <div className="flex h-full w-full items-center justify-center rounded bg-white">
                  {fileType === "audio" && (
                    <AudioLines className="h-5 w-5 text-blue-500" />
                  )}
                  {fileType === "video" && (
                    <Video className="h-5 w-5 text-blue-500" />
                  )}
                  {fileType === "document" && (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                  {fileType === "image" && (
                    <img
                      src={transformImage({ url: attachment.url, width: 150 })}
                      alt={fileName}
                      className="h-24 w-full rounded object-contain"
                    />
                  )}
                  {fileType === "unknown" && (
                    <File className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                {/* <span className="text-xs font-medium">{truncatedFileName}</span> */}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessageWithAttachments;
