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
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={cn(
          "relative my-5 flex w-[1000px] flex-col",
          message.role === "user" ? "" : "bg-custom-gray dark:bg-muted rounded-3xl p-5"
        )}
      >
          <div className="absolute right-10 top-7">
            <MessageActions
              onCopy={handleCopy}
              isAssistant={message.role === "assistant"}
              isLast={isLast}
              isEditing={isEditing}
              isHovering={isHovering}
            />
          </div>
          <div
            className={cn(
              "space-y-3",
              message.role === "user"
                ? "flex flex-row items-start gap-5"
                : "flex flex-col items-start"
            )}
          >
            {message.role === "system" ? (
              <div className="flex items-center space-x-4">
                <IconPencil
                  className="border-primary bg-primary text-secondary rounded border-[1px] p-1"
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
          ) : message.role === "assistant" ? (
            <MessageMarkdown content={message.content} />
          ) : (
            <div
              style={{ borderRadius: "15px 40px 30px 40px" }}
              className="bg-custom-gray p-3 dark:bg-muted"
            >
              <MessageMarkdown content={message.content} />
            </div>
          )}
          </div>
      </div>
    </div>
  )
}
