import { ApplicationContext } from "@/context/context"
import { FC, useContext, useState } from "react"
import { Message } from "../messages/message"
import { Message as MessageType } from "@/types/chat"
import { formatLabel } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from "../ui/separator";
import { useChatHandler } from "./chat-hooks/use-chat-handler";
import {v4 as uuidv4} from 'uuid';

interface ChatMessagesProps { }

export const ChatMessages: FC<ChatMessagesProps> = ({ }) => {
  const { chatMessages } = useContext(ApplicationContext)
  const [editingMessage, setEditingMessage] = useState<MessageType>()

  const {
    chatInputRef,
    handleSendMessage,
  } = useChatHandler()

  return chatMessages
    .sort((a, b) => new Date(a.message.created_at).getTime() - new Date(b.message.created_at).getTime())
    .map((chatMessage, index, array) => {
      return (
        <div className="flex flex-col justify-center items-center ">
          <Message
            key={chatMessage.message.id}
            message={chatMessage.message}
            isEditing={editingMessage?.id === chatMessage.message.id}
            isLast={index === array.length - 1}
          />
          {chatMessage.message.role === "assistant" && chatMessage.fileItems?.length > 0 && <div className="w-[1000px] ml-2">
            <h1 className="font-bold text-xl">Sources</h1>
            <Separator />
          </div>}
          {chatMessage.message.role === "assistant" && <div className={`flex flex-row space-x-5 mt-2 overflow-auto scrollbar-hide transition-all duration-300 justify-start items-center w-[1000px]`}>
            {chatMessage.fileItems?.map((fileItem) => {
              return (
                <div
                  className="bg-blue-100/50 dark:bg-muted border flex flex-row rounded-2xl p-4 text-xs sm:text-base w-[200px] flex-none justify-center items-center text-left"
                  key={uuidv4()}
                >
                  <div className="space-y-1 overflow-hidden text-left w-full h-[95px]">
                    <div className="flex flex-row space-x-0 justify-start items-start text-left w-full">
                      <Image src={fileItem && `/${fileItem.source}.svg`} alt={fileItem.title} className="mr-4 size-[20px]" width={10} height={10} />
                      <h3 className="text-sm mb-2 truncate font-semibold text-blue-800 group-hover:underline dark:text-blue-400">
                        {formatLabel(fileItem.source)}
                      </h3>
                    </div>
                    <p className="font-regular line-clamp-1 text-sm h-full" dangerouslySetInnerHTML={{ __html: fileItem.content }}></p>
                  </div>
                </div>
              )
            })}
          </div>}
          {chatMessage.message.role === "assistant" && chatMessage.followUpQuestions?.length > 0 && <div className="w-[1000px] m-2">
            <h1 className="font-bold text-xl">Related</h1>
            <Separator />
          </div>}
          {chatMessage.message.role === "assistant" && <div className={`flex flex-col space-y-3 mt-2 overflow-auto scrollbar-hide transition-all duration-300 justify-start items-center w-[1000px]`} >
             {chatMessage.followUpQuestions?.map((question, index) => {
              return (
                <div
                  className="bg-blue-100/50 dark:bg-muted border flex flex-col rounded-2xl p-3 cursor-pointer text-xs sm:text-base w-full justify-center items-start text-left"
                  key={uuidv4()}
                  onClick={() => handleSendMessage(question, false)}
                >
                  <p className="font-regular line-clamp-1 text-sm h-full">{question}</p>
                </div>
              )
            })}
          </div>}
        </div>
      )
    })
}

