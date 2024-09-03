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
import { set } from "nprogress"
import { processStreamChatResponse } from "@/lib/parse-chat-stream"


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
          processStreamChatResponse(response,setChatMessages,chat.id);
        })
        .catch(error => {
          console.error(error);
          setIsGenerating(false)
        });
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


