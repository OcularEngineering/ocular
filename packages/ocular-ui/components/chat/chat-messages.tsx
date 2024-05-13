import { ApplicationContext } from "@/context/context"
import { FC, useContext, useState } from "react"
import { Message } from "../messages/message"
import { Message as MessageType } from "@/types/chat"

interface ChatMessagesProps {}

export const ChatMessages: FC<ChatMessagesProps> = ({}) => {
  const { chatMessages } = useContext(ApplicationContext)
  const [editingMessage, setEditingMessage] = useState<MessageType>()

  return chatMessages
    .sort((a, b) =>  new Date(a.message.created_at).getTime() - new Date(b.message.created_at).getTime())
    .map((chatMessage, index, array) => {
      return (
        <Message
          key={chatMessage.message.id}
          message={chatMessage.message}
          isEditing={editingMessage?.id === chatMessage.message.id}
          isLast={index === array.length - 1}
        />
      )
    })
}

