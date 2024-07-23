import { consumeReadableStream } from "@/lib/consume-stream"
import api from "@/services/api"
// import { Tables, TablesInsert } from "@/supabase/types"
import {
  Chat,
  ChatFile,
  ChatMessage,
  ChatPayload,
  ChatSettings,
  // LLM,
  // MessageImage
} from "@/types/chat"
import { Profile } from "@/types/types"
import { Cancel, CancelTokenSource } from "axios"
import router from "next/router"
import React from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { createReader,readStream } from '@/lib/stream';
import { da, ro } from "date-fns/locale"


export const handleChat = async (
  chat: Chat,
  messageContent: string,
  cancelTokenSource: CancelTokenSource,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) => {
  
  

  const response = await fetchChatResponse(
    chat,
    messageContent, 
    true,
    cancelTokenSource,
    setIsGenerating,
    setChatMessages
  )
}

export const fetchChatResponse = async (
  chat: Chat,
  content: string,
  isHosted: boolean,
  cancelTokenSource: CancelTokenSource,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {

  let idx=0;
  api.chats.sendMessage(chat.id,{message:content,stream:true},cancelTokenSource)
        .then(async response => {
          console.log("Streaming Copilot Response")
          const reader = createReader(response.body);
          const chunks = readStream(reader);
          for await (const chunk of chunks) {
            setChatMessages(prevChatMessages => {
              const updatedMessages = [...prevChatMessages];
              if (idx=== 0) {
                updatedMessages.push({
                  message: {
                    chat_id: chunk.metadata?.chat_id,
                    content: chunk.choices[0].delta.content,
                    created_at: new Date(),
                    id: "123",
                    role: chunk.metadata.role,
                    updated_at: new Date(),
                    user_id: chunk.metadata.user_id
                  },
                  fileItems: []
                });
                idx++;
              } else {
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                lastMessage.message.content = chunk.choices[0].delta.content;
                lastMessage.message.updated_at = new Date();
              }
              return updatedMessages;
            });
          }
          
          // setChatMessages(prevChatMessages => [...prevChatMessages, 
          //   {
          //     message: {
          //       chat_id: data.metadata?.chat_id,
          //       content: data.choices[0].delta.content,
          //       created_at: new Date(),
          //       id: "123",
          //       role: data.metadata.role,
          //       updated_at: new Date(),
          //       user_id: data.metadata.user_id
          //     },
          //     fileItems: []
          //   }
          // ]);
          
        })
        .catch(error => {
          console.error(error);
          setIsGenerating(false)
        });
}

  // lastChatMessage: ChatMessage,
export const processResponse = async (
  response: Response,
  cancelTokenSource: CancelTokenSource,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  // setToolInUse: React.Dispatch<React.SetStateAction<string>>
) => {
  let fullText = ""
  let contentToAdd = ""

  
  if (response) {
    
    router.push(`/dashboard/chat/${response.message.chat_id}`)
    setChatMessages(prevChatMessages => [...prevChatMessages, 
      {
        message: {
          chat_id: response.message.chat_id,
          content: response.message.content,
          created_at: response.message.created_at,
          id: response.message.id,
          role: response.message.role,
          updated_at: response.message.updated_at,
          user_id: response.message.user_id
        },
        fileItems: []
      }
    ]);
    // return fullText
    return response.message.content
  } else {
    throw new Error("Response body is null")
  }
}

export const handleCreateChat = async (
  messageContent: string,
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
) => {
  const createdChat = await api.chats.create({name:messageContent})

  if (createdChat.status!==200) {
    throw new Error('Created Chat Request Failed');
  }

  setSelectedChat(createdChat.data.chat)
  setChats(chats => [createdChat.data.chat, ...chats])


  return createdChat.data.chat
}


