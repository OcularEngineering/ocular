import {
  IconPlayerStopFilled,
  IconSend
} from "@tabler/icons-react"

import { ApplicationContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { FC, useContext, useState } from "react"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"

interface ChatInputProps {}

export const ChatInput: FC<ChatInputProps> = ({}) => {
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const {
    userInput,
    isGenerating,
    focusPrompt,
    setFocusPrompt,
    isPromptPickerOpen,
    setIsPromptPickerOpen,
  } = useContext(ApplicationContext)

  const {
    chatInputRef,
    handleSendMessage,
  } = useChatHandler()

  const { handleInputChange } = usePromptAndCommand()

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isTyping && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      setIsPromptPickerOpen(false)
      if (userInput) {
        handleSendMessage(userInput, false)
      }
    }

    // Consolidate conditions to avoid TypeScript error
    if (
      isPromptPickerOpen 
    ) {
      if (
        event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault()
        // Toggle focus based on picker type
        if (isPromptPickerOpen) setFocusPrompt(!focusPrompt)
      }
    }
  }
  return (
    <div className="bg-background md:dark:hover:border-gray-100 mt-0 flex w-full items-center rounded-full border px-5 py-2 focus-within:shadow hover:shadow sm:max-w-xl sm:py-3 md:hover:border-white lg:max-w-5xl">

      <TextareaAutosize
        textareaRef={chatInputRef}
        className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-background py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={
          `Ask anything here...`
        }
        onValueChange={handleInputChange}
        value={userInput}
        minRows={1}
        maxRows={18}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsTyping(true)}
        onCompositionEnd={() => setIsTyping(false)}
      />

      <div className="bottom-[14px] right-3 cursor-pointer hover:opacity-50">
        {isGenerating ? (
          <IconPlayerStopFilled
            className="hover:bg-background animate-pulse rounded bg-transparent"
            size={25}
          />
        ) : (
          <IconSend
            className={cn(
              "text-black dark:text-white",
              !userInput && "cursor-not-allowed opacity-50"
            )}
            onClick={() => {
              if (!userInput) return

              handleSendMessage(userInput, false)
            }}
            size={24}
          />
        )}
      </div>
    </div>
  )
}