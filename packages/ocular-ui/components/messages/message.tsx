import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import {
  IconBolt,
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconCircleFilled,
  IconFileText,
  IconMoodSmile,
  IconPencil
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { FileIcon } from "../ui/file-icon"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { MessageActions } from "./message-actions"
import { MessageMarkdown } from "./message-markdown"
import {  MessageInterface } from "../../types/message"
import  Bot  from "../../public/bot.png"

const ICON_SIZE = 32

interface MessageProps {
  message: MessageInterface
  isEditing: boolean
  isLast: boolean
}

export const Message: FC<MessageProps> = ({
  message,
  isEditing,
  isLast,
}) => {
  const {
    isGenerating,
    setIsGenerating,
    firstTokenReceived,
    chatMessages,
  } = useContext(ChatbotUIContext)

  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const [isHovering, setIsHovering] = useState(false)
  const [editedMessage, setEditedMessage] = useState(message.content)

  const [showImagePreview, setShowImagePreview] = useState(false)

  const [showFileItemPreview, setShowFileItemPreview] = useState(false)

  const [viewSources, setViewSources] = useState(false)

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = message.content
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  return (
    <div
      className={cn(
        "flex w-full justify-center",
        message.role === "user" ? "" : "bg-secondary"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative flex w-full flex-col p-6 sm:w-[550px] sm:px-0 md:w-[650px] lg:w-[650px] xl:w-[700px]">
        <div className="absolute right-5 top-7 sm:right-0">
          <MessageActions
            onCopy={handleCopy}
            isAssistant={message.role === "assistant"}
            isLast={isLast}
            isEditing={isEditing}
            isHovering={isHovering}
          />
        </div>
        <div className="space-y-3">
          {message.role === "system" ? (
            <div className="flex items-center space-x-4">
              <IconPencil
                className="border-primary bg-primary text-secondary rounded border-DEFAULT p-1"
                size={ICON_SIZE}
              />
              <div className="text-lg font-semibold">Prompt</div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {message.role === "assistant" ? (
                  <Image
                    style={{
                      width: `${ICON_SIZE}px`,
                      height: `${ICON_SIZE}px`
                    }}
                    className="rounded"
                    src={Bot}
                    alt="assistant image"
                    height={ICON_SIZE}
                    width={ICON_SIZE}
                  />
              ) : 
               (
                <IconMoodSmile
                  className="bg-primary text-secondary border-primary rounded border-DEFAULT p-1"
                  size={ICON_SIZE}
                />
              )}
            </div>
          )}

        {isEditing ? (
            <TextareaAutosize
              textareaRef={editInputRef}
              className="text-md"
              value={editedMessage}
              onValueChange={setEditedMessage}
              maxRows={20}
            />
          ) : (
            <MessageMarkdown content={message.content} />
          )}
        </div>
      </div>
    </div>
  )
}
