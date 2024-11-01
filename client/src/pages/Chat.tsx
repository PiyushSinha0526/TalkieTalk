import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import Header from "@/components/Header";
import {
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAppSelector } from "@/hooks";

export default function Chat() {

  const { selectedChatItem } = useAppSelector((state) => state.chat);
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ChatSidebar />
        <ResizableHandle withHandle />
        <ChatWindow selectedChatItem={selectedChatItem} />
      </ResizablePanelGroup>
    </div>
  );
}
