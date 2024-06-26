import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ApplicationContext } from "@/context/context"
import { useParams } from "next/navigation"
import { FC, useContext, useEffect, useState } from "react"
import { useScroll } from "./chat-hooks/use-scroll"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { ChatSecondaryButtons } from "./chat-secondary-buttons"

import api from "@/services/api"


interface ChatUIProps {}

export const ChatUI: FC<ChatUIProps> = ({}) => {

  const params = useParams()

  const {
    setChatMessages,
    selectedChat,
    setSelectedChat,
  } = useContext(ApplicationContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const {
    messagesStartRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
    setIsAtBottom,
  } = useScroll()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      await fetchMessages()
      await fetchChat()

      scrollToBottom()
      setIsAtBottom(true)
    }

    if (params && params.chatid) {
      fetchData().then(() => {
        handleFocusChatInput()
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [params])

  const fetchMessages = async () => {
    const fetchedMessages = await api.chats.retrieve(params.chatid as string)
    const fetchedChatMessages = fetchedMessages.data.chat.messages.map(message => {
      return {
        message,
      }
    })
    setChatMessages(fetchedChatMessages)
  }

  const fetchChat = async () => {
    const response = await api.chats.retrieve(params.chatid as string)
    if (!response.data.chat) return
    setSelectedChat(response.data.chat)
  }

  if (loading) {
    return < div> Loading </div>
  }

  return (
    <div className="relative bg-background flex h-full flex-col items-center">
      <div className="absolute left-4 top-2.5 flex justify-center">
        <ChatSecondaryButtons />
        <div className="bg-background flex max-h-[50px] min-h-[50px] w-full items-center justify-center px-10 font-semibold">
          <div className="max-w-[300px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
            {selectedChat?.name || "Chat"}
          </div>
        </div>
      </div>

      <div
        className="bg-transparent flex size-full flex-col overflow-auto mt-10"
        onScroll={handleScroll}
      >
        <div ref={messagesStartRef} />
        <ChatMessages />
        <div ref={messagesEndRef} />
      </div>

    <div className="relative z-10 rounded-full items-end py-5 sm:w-[500px] md:w-[1000px] lg:w-[1000px] xl:w-[1000px]">
        <ChatInput />
      </div>
    </div>
  )
}
