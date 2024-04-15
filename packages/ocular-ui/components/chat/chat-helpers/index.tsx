// Only used in use-chat-handler.tsx to keep it clean

// import { createChatFiles } from "@/db/chat-files"
// import { createChat } from "@/db/chats"
// import { createMessageFileItems } from "@/db/message-file-items"
// import { createMessages, updateMessage } from "@/db/messages"
// import { uploadMessageImage } from "@/db/storage/message-images"
// import {
//   buildFinalMessages,
//   buildGoogleGeminiFinalMessages
// } from "@/lib/build-prompt"
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

// export const validateChatSettings = (
//   chatSettings: ChatSettings | null,
//   modelData: LLM | undefined,
//   profile: Tables<"profiles"> | null,
//   selectedWorkspace: Tables<"workspaces"> | null,
//   messageContent: string
// ) => {
//   if (!chatSettings) {
//     throw new Error("Chat settings not found")
//   }

//   if (!modelData) {
//     throw new Error("Model not found")
//   }

//   if (!profile) {
//     throw new Error("Profile not found")
//   }

//   if (!selectedWorkspace) {
//     throw new Error("Workspace not found")
//   }

//   if (!messageContent) {
//     throw new Error("Message content not found")
//   }
// }

// export const handleRetrieval = async (
//   userInput: string,
//   newMessageFiles: ChatFile[],
//   chatFiles: ChatFile[],
//   embeddingsProvider: "openai" | "local",
//   sourceCount: number
// ) => {
//   const response = await fetch("/api/retrieval/retrieve", {
//     method: "POST",
//     body: JSON.stringify({
//       userInput,
//       fileIds: [...newMessageFiles, ...chatFiles].map(file => file.id),
//       embeddingsProvider,
//       sourceCount
//     })
//   })

//   if (!response.ok) {
//     console.error("Error retrieving:", response)
//   }

//   const { results } = (await response.json()) as {
//     results: Tables<"file_items">[]
//   }

//   return results
// }

// export const createTempMessages = (
//   messageContent: string,
//   chatMessages: ChatMessage[],
//   // chatSettings: ChatSettings,
//   // b64Images: string[],
//   isRegeneration: boolean,
//   setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
//   // selectedAssistant: Tables<"assistants"> | null
// ) => {
//   let tempUserChatMessage: ChatMessage = {
//     message: {
//       chat_id: "",
//       content: messageContent,
//       created_at: "",
//       // id: uuidv4(),
//       // image_paths: b64Images,
//       // model: chatSettings.model,
//       role: "user",
//       // sequence_number: chatMessages.length,
//       updated_at: "",
//       // user_id: ""
//     },
//     // fileItems: []
//   }

//   let tempAssistantChatMessage: ChatMessage = {
//     message: {
//       chat_id: "",
//       // assistant_id: selectedAssistant?.id || null,
//       content: "",
//       created_at: "",
//       id: uuidv4(),
//       // image_paths: [],
//       // model: chatSettings.model,
//       role: "assistant",
//       sequence_number: chatMessages.length + 1,
//       updated_at: "",
//       user_id: ""
//     },
//     fileItems: []
//   }

//   let newMessages = []

//   if (isRegeneration) {
//     const lastMessageIndex = chatMessages.length - 1
//     chatMessages[lastMessageIndex].message.content = ""
//     newMessages = [...chatMessages]
//   } else {
//     newMessages = [
//       ...chatMessages,
//       tempUserChatMessage,
//       tempAssistantChatMessage
//     ]
//   }

//   setChatMessages(newMessages)

//   return {
//     tempUserChatMessage,
//     tempAssistantChatMessage
//   }
// }

// export const handleLocalChat = async (
//   payload: ChatPayload,
//   profile: Tables<"profiles">,
//   chatSettings: ChatSettings,
//   tempAssistantMessage: ChatMessage,
//   isRegeneration: boolean,
//   newAbortController: AbortController,
//   setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
//   setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
//   setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
//   setToolInUse: React.Dispatch<React.SetStateAction<string>>
// ) => {
//   const formattedMessages = await buildFinalMessages(payload, profile, [])

//   // Ollama API: https://github.com/jmorganca/ollama/blob/main/docs/api.md
//   const response = await fetchChatResponse(
//     process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/chat",
//     {
//       model: chatSettings.model,
//       messages: formattedMessages,
//       options: {
//         temperature: payload.chatSettings.temperature
//       }
//     },
//     false,
//     newAbortController,
//     setIsGenerating,
//     setChatMessages
//   )

//   return await processResponse(
//     response,
//     isRegeneration
//       ? payload.chatMessages[payload.chatMessages.length - 1]
//       : tempAssistantMessage,
//     false,
//     newAbortController,
//     setFirstTokenReceived,
//     setChatMessages,
//     setToolInUse
//   )
// }

export const handleChat = async (
  chat: Chat,
  messageContent: string,
  // payload: ChatPayload,
  // profile: Profile,
  // modelData: LLM,
  // tempAssistantChatMessage: ChatMessage,
  // isRegeneration: boolean,
  cancelTokenSource: CancelTokenSource,
  // newMessageImages: MessageImage[],
  // chatImages: MessageImage[],
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  // setToolInUse: React.Dispatch<React.SetStateAction<string>>
) => {
  const requestBody = {
    // chatSettings: payload.chatSettings,
  
    // customModelId: provider === "custom" ? modelData.hostedId : ""
  }

  const response = await fetchChatResponse(
    chat,
    messageContent, 
    true,
    cancelTokenSource,
    setIsGenerating,
    setChatMessages
  )

      // isRegeneration
    //   ? payload.chatMessages[payload.chatMessages.length - 1]
    //   : tempAssistantChatMessage,

  return await processResponse(
    response,
    // true,
    cancelTokenSource,
    setFirstTokenReceived,
    setChatMessages,
    // setToolInUse
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
  const response = await api.chats.sendMessage(chat.id,{message:content,stream:false},cancelTokenSource)
  if (!response.data.ok) {
    if (response.status === 404) {
      toast.error(
        "Failed To Chat",
      )
    }
    const errorData = await response.data
    toast.error(errorData.message)
    setIsGenerating(false)
  }
  return response.data
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

  // console.log("processResponse",response.message)

  if (response) {
    // await consumeReadableStream(
    //   response.body,
    //   chunk => {
    //     setFirstTokenReceived(true)
    //     // setToolInUse("none")

    //     try {
    //       contentToAdd = isHosted
    //         ? chunk
    //         : // Ollama's streaming endpoint returns new-line separated JSON
    //           // objects. A chunk may have more than one of these objects, so we
    //           // need to split the chunk by new-lines and handle each one
    //           // separately.
    //           chunk
    //             .trimEnd()
    //             .split("\n")
    //             .reduce(
    //               (acc, line) => acc + JSON.parse(line).message.content,
    //               ""
    //             )
    //       fullText += contentToAdd
    //     } catch (error) {
    //       console.error("Error parsing JSON:", error)
    //     }

    //     setChatMessages(prev =>
    //       prev.map(chatMessage => {
    //         // if (chatMessage.message.id === lastChatMessage.message.id) {
    //         //   const updatedChatMessage: ChatMessage = {
    //         //     message: {
    //         //       ...chatMessage.message,
    //         //       content: fullText
    //         //     },
    //         //     fileItems: chatMessage.fileItems
    //         //   }

    //         //   return updatedChatMessage
    //         // }

    //         return chatMessage
    //       })
    //     )
    //   },
    //   cancelTokenSource.token
    // )
    
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
  // chatSettings: ChatSettings,
  // profile: Tables<"profiles">,
  // selectedWorkspace: Tables<"workspaces">,
  messageContent: string,
  // selectedAssistant: Tables<"assistants">,
  // newMessageFiles: ChatFile[],
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  // setChatFiles: React.Dispatch<React.SetStateAction<ChatFile[]>>
) => {
  const createdChat = await api.chats.create({name:messageContent})

  if (createdChat.status!==200) {
    throw new Error('Created Chat Request Failed');
  }

  // const createdChat = await createChat({
  //   user_id: profile.user_id,
  //   workspace_id: selectedWorkspace.id,
  //   assistant_id: selectedAssistant?.id || null,
  //   context_length: chatSettings.contextLength,
  //   include_profile_context: chatSettings.includeProfileContext,
  //   include_workspace_instructions: chatSettings.includeWorkspaceInstructions,
  //   model: chatSettings.model,
  //   name: messageContent.substring(0, 100),
  //   prompt: chatSettings.prompt,
  //   temperature: chatSettings.temperature,
  //   embeddings_provider: chatSettings.embeddingsProvider
  // })

  setSelectedChat(createdChat.data.chat)
  setChats(chats => [createdChat.data.chat, ...chats])

  // await createChatFiles(
  //   newMessageFiles.map(file => ({
  //     user_id: profile.user_id,
  //     chat_id: createdChat.id,
  //     file_id: file.id
  //   }))
  // )

  // setChatFiles(prev => [...prev, ...newMessageFiles])

  return createdChat.data.chat
}

// export const handleCreateMessages = async (
//   chatMessages: ChatMessage[],
//   currentChat: Tables<"chats">,
//   profile: Tables<"profiles">,
//   modelData: LLM,
//   messageContent: string,
//   generatedText: string,
//   newMessageImages: MessageImage[],
//   isRegeneration: boolean,
//   retrievedFileItems: Tables<"file_items">[],
//   setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
//   setChatFileItems: React.Dispatch<
//     React.SetStateAction<Tables<"file_items">[]>
//   >,
//   setChatImages: React.Dispatch<React.SetStateAction<MessageImage[]>>,
//   selectedAssistant: Tables<"assistants"> | null
// ) => {
//   const finalUserMessage: TablesInsert<"messages"> = {
//     chat_id: currentChat.id,
//     assistant_id: null,
//     user_id: profile.user_id,
//     content: messageContent,
//     model: modelData.modelId,
//     role: "user",
//     sequence_number: chatMessages.length,
//     image_paths: []
//   }

//   const finalAssistantMessage: TablesInsert<"messages"> = {
//     chat_id: currentChat.id,
//     assistant_id: selectedAssistant?.id || null,
//     user_id: profile.user_id,
//     content: generatedText,
//     model: modelData.modelId,
//     role: "assistant",
//     sequence_number: chatMessages.length + 1,
//     image_paths: []
//   }

//   let finalChatMessages: ChatMessage[] = []

//   if (isRegeneration) {
//     const lastStartingMessage = chatMessages[chatMessages.length - 1].message

//     const updatedMessage = await updateMessage(lastStartingMessage.id, {
//       ...lastStartingMessage,
//       content: generatedText
//     })

//     chatMessages[chatMessages.length - 1].message = updatedMessage

//     finalChatMessages = [...chatMessages]

//     setChatMessages(finalChatMessages)
//   } else {
//     const createdMessages = await createMessages([
//       finalUserMessage,
//       finalAssistantMessage
//     ])

//     // Upload each image (stored in newMessageImages) for the user message to message_images bucket
//     const uploadPromises = newMessageImages
//       .filter(obj => obj.file !== null)
//       .map(obj => {
//         let filePath = `${profile.user_id}/${currentChat.id}/${
//           createdMessages[0].id
//         }/${uuidv4()}`

//         return uploadMessageImage(filePath, obj.file as File).catch(error => {
//           console.error(`Failed to upload image at ${filePath}:`, error)
//           return null
//         })
//       })

//     const paths = (await Promise.all(uploadPromises)).filter(
//       Boolean
//     ) as string[]

//     setChatImages(prevImages => [
//       ...prevImages,
//       ...newMessageImages.map((obj, index) => ({
//         ...obj,
//         messageId: createdMessages[0].id,
//         path: paths[index]
//       }))
//     ])

//     const updatedMessage = await updateMessage(createdMessages[0].id, {
//       ...createdMessages[0],
//       image_paths: paths
//     })

//     const createdMessageFileItems = await createMessageFileItems(
//       retrievedFileItems.map(fileItem => {
//         return {
//           user_id: profile.user_id,
//           message_id: createdMessages[1].id,
//           file_item_id: fileItem.id
//         }
//       })
//     )

//     finalChatMessages = [
//       ...chatMessages,
//       {
//         message: updatedMessage,
//         fileItems: []
//       },
//       {
//         message: createdMessages[1],
//         fileItems: retrievedFileItems.map(fileItem => fileItem.id)
//       }
//     ]

//     setChatFileItems(prevFileItems => {
//       const newFileItems = retrievedFileItems.filter(
//         fileItem => !prevFileItems.some(prevItem => prevItem.id === fileItem.id)
//       )

//       return [...prevFileItems, ...newFileItems]
//     })

//     setChatMessages(finalChatMessages)
//   }
// }
