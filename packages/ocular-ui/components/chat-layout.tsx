"use client"

import React, { ReactNode } from 'react';

import { ChatbotUIContext } from "@/context/context"
import { ChatSideBar } from "@/components/chat/chat-sidebar/chat-sidebar"
import { GlobalState } from "@/lib/global-state"
import { useTheme } from "next-themes"
import { useContext } from "react"
import { useEffect,useState } from 'react';
import api from "@/services/api"
import { ContentType } from "@/types"
import { Tabs } from "@/components/ui/tabs"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { IconChevronCompactRight } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

import { SidebarSwitcher } from "@/components/chat/chat-sidebar/sidebar-switcher"

export const SIDEBAR_WIDTH = 600

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {

  const pathname = usePathname()
  const router = useRouter()
  const [chatsLoaded, setChatsLoaded] = useState(false)
  const { chatMessages, setChats } = useContext(ChatbotUIContext)
  const searchParams = useSearchParams()
  const tabValue = searchParams.get("tab") || "chats"

  const [contentType, setContentType] = useState<ContentType>(
    tabValue as ContentType
  )

  const [showSidebar, setShowSidebar] = useState(false)
  // const [showSidebar, setShowSidebar] = useState(
  //   localStorage.getItem("showSidebar") === "true"
  // )

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

  const handleToggleSidebar = () => {
    setShowSidebar(prevState => !prevState)
    localStorage.setItem("showSidebar", String(!showSidebar))
  }

  const { theme } = useTheme()

  return (
    <div className="flex size-full">

      <Button
          className={cn(
            "absolute left-[58px] top-[50%] z-10 size-[32px] cursor-pointer"
          )}
          style={{
            marginLeft: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
            transform: showSidebar ? "rotate(180deg)" : "rotate(0deg)"
          }}
          variant="ghost"
          size="icon"
          onClick={handleToggleSidebar}
        >
          <IconChevronCompactRight size={24} />
      </Button>
      <div
        className={cn("bg-custom-gray/20 duration-200 rounded-r-3xl mr-3")}
        style={{
          minWidth: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
          maxWidth: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
          width: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
          boxShadow: showSidebar ? "0px 0px 15px -5px rgba(0, 0, 0, 0.25)" : "none"
        }}
      >
        {showSidebar && (
          <Tabs
            className="flex h-full dark:bg-muted rounded-r-3xl"
            value={contentType}
            onValueChange={tabValue => {
              setContentType(tabValue as ContentType)
              router.replace(`${pathname}?tab=${tabValue}`)
            }}
          >
            <SidebarSwitcher onContentTypeChange={setContentType} />

            <ChatSideBar contentType={contentType} showSidebar={showSidebar} />
          </Tabs>
        )}
      </div>
      <div className='flex flex-col h-screen w-full justify-center'>{children}</div>
    </div>
  );
}
