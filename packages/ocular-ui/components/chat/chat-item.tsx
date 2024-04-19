import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { Chat } from "@/types/chat"
import { useParams, useRouter } from "next/navigation"
import { FC, useContext, useRef } from "react"
// import { DeleteChat } from "./delete-chat"
// import { UpdateChat } from "./update-chat"

interface ChatItemProps {
  chat: Chat
}

export const ChatItem: FC<ChatItemProps> = ({ chat }) => {
  const {
    selectedChat,
    setSelectedChat,
  } = useContext(ChatbotUIContext)

  const router = useRouter()
  const params = useParams()
  const isActive = params.chatid === chat.id || selectedChat?.id === chat.id

  const itemRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    setSelectedChat(chat)
    return router.push(`/dashboard/chat/${chat.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  return (
    <div
      ref={itemRef}
      className={cn(
        "hover:bg-accent focus:bg-accent group flex flex-col w-full cursor-pointer items-start space-y-2 rounded p-2 hover:opacity-50 focus:outline-none",
        isActive && "bg-gray-100 dark:bg-gray-800"
      )}
      style={{ borderRadius: "20px 20px 20px 20px" }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <div className="ml-3 flex-1 truncate text-sm font-semibold">
        {chat.name}
      </div>
      <div className="ml-3 flex-1 truncate text-xs text-gray-400">
        {`${new Date(chat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${new Date(chat.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`}
      </div>
{/* 
      <div
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
        }}
        className={`ml-2 flex space-x-2 ${!isActive && "w-11 opacity-0 group-hover:opacity-100"}`}
      > */}
        {/* <UpdateChat chat={chat} />

        <DeleteChat chat={chat} /> */}
      {/* </div> */}
    </div>
  )
}