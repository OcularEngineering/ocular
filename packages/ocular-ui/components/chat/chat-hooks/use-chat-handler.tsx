import { ChatbotUIContext } from "@/context/context"
import { buildFinalMessages } from "@/lib/build-prompt"
// import { ChatMessage, ChatPayload, LLMID, ModelProvider } from "@/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef } from "react"
import axios from "axios";
import {
  // createTempMessages,
  handleCreateChat,
  // handleCreateMessages,
  handleChat,
  // handleLocalChat,
  // handleRetrieval,
  // processResponse,
  // validateChatSettings
} from "../chat-helpers/index"

export const useChatHandler = () => {
  const router = useRouter()

  const {
    userInput,
    // chatFiles,
    setUserInput,
    // setNewMessageImages,
    // profile,
    setIsGenerating,
    setChatMessages,
    setFirstTokenReceived,
    selectedChat,
    // selectedWorkspace,
    setSelectedChat,
    setChats,
    // setSelectedTools,
    // availableLocalModels,
    // availableOpenRouterModels,
    cancelTokenSource,
    setCancelTokenSource,
    // chatSettings,
    // newMessageImages,
    // selectedAssistant,
    chatMessages,
    // chatImages,
    // setChatImages,
    // setChatFiles,
    // setNewMessageFiles,
    // setShowFilesDisplay,
    // newMessageFiles,
    // chatFileItems,
    // setChatFileItems,
    // setToolInUse,
    // useRetrieval,
    // sourceCount,
    setIsPromptPickerOpen,
    // setIsFilePickerOpen,
    // selectedTools,
    // selectedPreset,
    // setChatSettings,
    // models,
    isPromptPickerOpen,
    // isFilePickerOpen,
    // isToolPickerOpen
  } = useContext(ChatbotUIContext)

  const chatInputRef = useRef<HTMLTextAreaElement>(null)


  // // || !isFilePickerOpen || !isToolPickerOpen
  // isFilePickerOpen, isToolPickerOpen
  useEffect(() => {
    if (!isPromptPickerOpen) {
      chatInputRef.current?.focus()
    }
  }, [isPromptPickerOpen])

  const handleNewChat = async () => {
    // if (!selectedWorkspace) return

    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)
    // setChatFileItems([])

    setIsGenerating(false)
    setFirstTokenReceived(false)

    // setChatFiles([])
    // setChatImages([])
    // setNewMessageFiles([])
    // setNewMessageImages([])
    // setShowFilesDisplay(false)
    setIsPromptPickerOpen(false)
    // setIsFilePickerOpen(false)

    // setSelectedTools([])
    // setToolInUse("none")

    // if (selectedAssistant) {
    //   setChatSettings({
    //     model: selectedAssistant.model as LLMID,
    //     prompt: selectedAssistant.prompt,
    //     temperature: selectedAssistant.temperature,
    //     contextLength: selectedAssistant.context_length,
    //     includeProfileContext: selectedAssistant.include_profile_context,
    //     includeWorkspaceInstructions:
    //       selectedAssistant.include_workspace_instructions,
    //     embeddingsProvider: selectedAssistant.embeddings_provider as
    //       | "openai"
    //       | "local"
    //   })

    //   let allFiles = []

    //   const assistantFiles = (
    //     await getAssistantFilesByAssistantId(selectedAssistant.id)
    //   ).files
    //   allFiles = [...assistantFiles]
    //   const assistantCollections = (
    //     await getAssistantCollectionsByAssistantId(selectedAssistant.id)
    //   ).collections
    //   for (const collection of assistantCollections) {
    //     const collectionFiles = (
    //       await getCollectionFilesByCollectionId(collection.id)
    //     ).files
    //     allFiles = [...allFiles, ...collectionFiles]
    //   }
    //   const assistantTools = (
    //     await getAssistantToolsByAssistantId(selectedAssistant.id)
    //   ).tools

    //   setSelectedTools(assistantTools)
    //   setChatFiles(
    //     allFiles.map(file => ({
    //       id: file.id,
    //       name: file.name,
    //       type: file.type,
    //       file: null
    //     }))
    //   )

    //   if (allFiles.length > 0) setShowFilesDisplay(true)
    // } else if (selectedPreset) {
    //   setChatSettings({
    //     model: selectedPreset.model as LLMID,
    //     prompt: selectedPreset.prompt,
    //     temperature: selectedPreset.temperature,
    //     contextLength: selectedPreset.context_length,
    //     includeProfileContext: selectedPreset.include_profile_context,
    //     includeWorkspaceInstructions:
    //       selectedPreset.include_workspace_instructions,
    //     embeddingsProvider: selectedPreset.embeddings_provider as
    //       | "openai"
    //       | "local"
    //   })
    // } else if (selectedWorkspace) {
    //   // setChatSettings({
    //   //   model: (selectedWorkspace.default_model ||
    //   //     "gpt-4-1106-preview") as LLMID,
    //   //   prompt:
    //   //     selectedWorkspace.default_prompt ||
    //   //     "You are a friendly, helpful AI assistant.",
    //   //   temperature: selectedWorkspace.default_temperature || 0.5,
    //   //   contextLength: selectedWorkspace.default_context_length || 4096,
    //   //   includeProfileContext:
    //   //     selectedWorkspace.include_profile_context || true,
    //   //   includeWorkspaceInstructions:
    //   //     selectedWorkspace.include_workspace_instructions || true,
    //   //   embeddingsProvider:
    //   //     (selectedWorkspace.embeddings_provider as "openai" | "local") ||
    //   //     "openai"
    //   // })
    // }

    return router.push(`/dashboard/chat`)
  }

  const handleFocusChatInput = () => {
    chatInputRef.current?.focus()
  }

  const handleSendMessage = async (
    messageContent: string,
    isRegeneration: boolean
  ) => {
    const startingInput = messageContent

    try {
      setUserInput("")
      setIsGenerating(true)
      setIsPromptPickerOpen(false)
      // setIsFilePickerOpen(false)
      // setNewMessageImages([])

      const cancelTokenSource  = axios.CancelToken.source();
      setCancelTokenSource(cancelTokenSource);

      // validateChatSettings(
      //   chatSettings,
      //   modelData,
      //   profile,
      //   selectedWorkspace,
      //   messageContent
      // )

      let currentChat = selectedChat ? { ...selectedChat } : null

      // const b64Images = newMessageImages.map(image => image.base64)

      // let retrievedFileItems: Tables<"file_items">[] = []

      // if (
      //   (newMessageFiles.length > 0 || chatFiles.length > 0) &&
      //   useRetrieval
      // ) {
      //   setToolInUse("retrieval")

      //   retrievedFileItems = await handleRetrieval(
      //     userInput,
      //     newMessageFiles,
      //     chatFiles,
      //     chatSettings!.embeddingsProvider,
      //     sourceCount
      //   )
      // }

      // const { tempUserChatMessage, tempAssistantChatMessage } =
      //   createTempMessages(
      //     messageContent,
      //     chatMessages,
      //     // chatSettings!,
      //     // b64Images,
      //     isRegeneration,
      //     setChatMessages,
      //     // selectedAssistant
      //   )

      // let payload: ChatPayload = {
      //   // chatSettings: chatSettings!,
      //   // workspaceInstructions: selectedWorkspace!.instructions || "",
      //   chatMessages: isRegeneration
      //     ? [...chatMessages]
      //     : [...chatMessages, tempUserChatMessage],
      //   // assistant: selectedChat?.assistant_id ? selectedAssistant : null,
      //   // messageFileItems: retrievedFileItems,
      //   // chatFileItems: chatFileItems
      // }

      if (!currentChat) {
        currentChat = await handleCreateChat(
          messageContent,
          // newMessageFiles,
          setSelectedChat,
          setChats,
          // setChatFiles
        )
      }

      if (!currentChat) return

      let generatedText = ""
      generatedText = await handleChat(
            currentChat,
            messageContent,
            cancelTokenSource,
            setIsGenerating,
            setFirstTokenReceived,
            setChatMessages,
      )

      //   setChats(prevChats => {
      //     const updatedChats = prevChats.map(prevChat =>
      //       prevChat.id === updatedChat.id ? updatedChat : prevChat
      //     )

      //     return updatedChats
      //   })
      // }

      // await handleCreateMessages(
      //   chatMessages,
      //   currentChat,
      //   profile!,
      //   modelData!,
      //   messageContent,
      //   generatedText,
      //   newMessageImages,
      //   isRegeneration,
      //   retrievedFileItems,
      //   setChatMessages,
      //   setChatFileItems,
      //   setChatImages,
      //   selectedAssistant
      // )

      setIsGenerating(false)
      setFirstTokenReceived(false)
      setUserInput("")
    } catch (error) {
      setIsGenerating(false)
      setFirstTokenReceived(false)
      setUserInput(startingInput)
    }
  }

  return {
    chatInputRef,
    // prompt,
    handleNewChat,
    handleSendMessage,
    handleFocusChatInput,
  }
}
