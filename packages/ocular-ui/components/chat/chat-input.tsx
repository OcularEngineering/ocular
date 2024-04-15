import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import {
  IconBolt,
  IconCirclePlus,
  IconPlayerStopFilled,
  IconSend
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { useChatHistoryHandler } from "./chat-hooks/use-chat-history"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"

interface ChatInputProps {}

export const ChatInput: FC<ChatInputProps> = ({}) => {
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const {
    userInput,
    chatMessages,
    isGenerating,
    focusPrompt,
    setFocusPrompt,
    isPromptPickerOpen,
    setIsPromptPickerOpen,
  } = useContext(ChatbotUIContext)

  const {
    chatInputRef,
    handleSendMessage,
    // handleStopMessage,
    handleFocusChatInput
  } = useChatHandler()

  const { handleInputChange } = usePromptAndCommand()

  const {
    setNewMessageContentToNextUserMessage,
    setNewMessageContentToPreviousUserMessage
  } = useChatHistoryHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isTyping && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      setIsPromptPickerOpen(false)
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
    <>
      <div className="flex flex-col flex-wrap justify-center gap-2">
      </div>

      <div className="border-input relative mt-3 flex min-h-[60px] w-full items-center justify-center rounded-xl border-2">
        <TextareaAutosize
          textareaRef={chatInputRef}
          className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={
            // `Ask anything. Type "@" for assistants, "/" for prompts, "#" for files, and "!" for tools.`
            `Ask anything. Type @  /  #  !`
          }
          onValueChange={handleInputChange}
          value={userInput}
          minRows={1}
          maxRows={18}
          onKeyDown={handleKeyDown}
          // onPaste={handlePaste}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
        />

        <div className="absolute bottom-[14px] right-3 cursor-pointer hover:opacity-50">
          {isGenerating ? (
            <IconPlayerStopFilled
              className="hover:bg-background animate-pulse rounded bg-transparent p-1"
              // onClick={handleStopMessage}
              size={30}
            />
          ) : (
            <IconSend
              className={cn(
                "bg-primary text-secondary rounded p-1",
                !userInput && "cursor-not-allowed opacity-50"
              )}
              onClick={() => {
                if (!userInput) return
                handleSendMessage(userInput,false)
              }}
              size={30}
            />
          )}
        </div>
      </div>
    </>
  )
}