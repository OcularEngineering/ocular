import { ApplicationContext } from "@/context/context"
import { buildFinalMessages } from "@/lib/build-prompt"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef } from "react"
import axios from "axios";
import {
  handleCreateChat,
  handleChat,
} from "../chat-helpers/index"

export const useChatHandler = () => {
  const router = useRouter()

  const {
    userInput,
    setUserInput,
    setIsGenerating,
    setChatMessages,
    setFirstTokenReceived,
    selectedChat,
    setSelectedChat,
    setChats,
    cancelTokenSource,
    setCancelTokenSource,
    chatMessages,
    setIsPromptPickerOpen,
    isPromptPickerOpen,
  } = useContext(ApplicationContext)

  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (!isPromptPickerOpen) {
      chatInputRef.current?.focus()
    }
  }, [isPromptPickerOpen])

  const handleNewChat = async () => {

    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)
    setIsGenerating(false)
    setFirstTokenReceived(false)
    setIsPromptPickerOpen(false)
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

      let currentChat = selectedChat ? { ...selectedChat } : null


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
