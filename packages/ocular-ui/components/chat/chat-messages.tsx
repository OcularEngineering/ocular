import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { FC, useContext, useState } from "react"
import { Message } from "../messages/message"
import { Message as MessageType } from "@/types/chat"

interface ChatMessagesProps {}

export const ChatMessages: FC<ChatMessagesProps> = ({}) => {
  const { chatMessages} = useContext(ChatbotUIContext)

  // const { handleSendEdit } = useChatHandler()

  const [editingMessage, setEditingMessage] = useState<MessageType>()
  return chatMessages
    .sort((a, b) =>  new Date(a.message.created_at).getTime() - new Date(b.message.created_at).getTime())
    .map((chatMessage, index, array) => {
      // const messageFileItems = chatFileItems.filter(
      //   (chatFileItem, _, self) =>
      //     chatMessage.fileItems.includes(chatFileItem.id) &&
      //     self.findIndex(item => item.id === chatFileItem.id) === _
      // )
      // return (
      //   <div key={chatMessage.message.id} >{chatMessage.message.content}</div>
      // )

      return (
        <Message
          key={chatMessage.message.id}
          message={chatMessage.message}
          // fileItems={messageFileItems}
          isEditing={editingMessage?.id === chatMessage.message.id}
          isLast={index === array.length - 1}
          // onStartEdit={setEditingMessage}
          // onCancelEdit={() => setEditingMessage(undefined)}
          // onSubmitEdit={handleSendEdit}
        />
      )
    })
}
