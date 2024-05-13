import React, { ReactNode } from 'react';
import { ChatHelp } from "@/components/chat/chat-help"
// import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
// import { ChatInput } from "@/components/chat/chat-input"
// import { ChatSettings } from "@/components/chat/chat-settings"
import { ChatUI } from "@/components/chat/chat-ui"
// import { QuickSettings } from "@/components/chat/quick-settings"
// import { Brand } from "@/components/ui/brand"
import { ApplicationContext } from "@/context/context"
import { ChatSideBar } from "@/components/chat/chat-sidebar/chat-sidebar"
import { GlobalState } from "@/lib/global-state"
// import useHotkey from "@/lib/hooks/use-hotkey"
import { useTheme } from "next-themes"
import { useContext } from "react"
import { useEffect,useState } from 'react';
import api from "@/services/api"
import { ContentType } from "@/types"
import { Tabs } from "@/components/ui/tabs"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export const SIDEBAR_WIDTH = 350

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()

  const [chatsLoaded, setChatsLoaded] = useState(false);

  const { chatMessages, setChats } = useContext(ApplicationContext)
  const searchParams = useSearchParams()
  const tabValue = searchParams.get("tab") || "chats"
  const [contentType, setContentType] = useState<ContentType>(
    tabValue as ContentType
  )

  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem("showSidebar");
      if (storedValue !== null) {
        setShowSidebar(storedValue === "true");
      }
    }
  }, []);

  const fetchChats = async() => {
    const fetchedChats = await api.chats.list()
    setChats(fetchedChats.data.chats)
    setChatsLoaded(true);
  };

  // Get Chats From Server, Place Them In Context And Render Them On Sidebar
  useEffect(() => {
    fetchChats();
  }, []);

  const { theme } = useTheme()

  return (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <div className="flex-row items-left justify-left">
     <div
      // className={cn(
      //   "duration-200 dark:border-none " + (showSidebar ? "border-r-2" : "")
      // )}
        style={{
          // minWidth: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
          // maxWidth: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
          // width: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px"
        }}
      >
          <div className="flex-row items-left justify-left">
            <ChatSideBar contentType={contentType} showSidebar={showSidebar}/>
          </div>
      </div>
    </div>  
    <div>{children}</div>
  </div>
  );
}

export default ChatLayout;