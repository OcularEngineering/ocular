import { ApplicationContext } from "@/context/context"
// import { getAssistantCollectionsByAssistantId } from "@/db/assistant-collections"
// import { getAssistantFilesByAssistantId } from "@/db/assistant-files"
// import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
// import { getCollectionFilesByCollectionId } from "@/db/collection-files"
// import { Tables } from "@/supabase/types"
// import { LLMID } from "@/types"
import { useContext } from "react"

export const usePromptAndCommand = () => {
  const {
    userInput,
    setUserInput,
    setIsPromptPickerOpen,
  } = useContext(ApplicationContext)

  const handleInputChange = (value: string) => {
    const atTextRegex = /@([^ ]*)$/
    const slashTextRegex = /\/([^ ]*)$/
    const hashtagTextRegex = /#([^ ]*)$/
    const toolTextRegex = /!([^ ]*)$/
    const atMatch = value.match(atTextRegex)
    const slashMatch = value.match(slashTextRegex)
    const hashtagMatch = value.match(hashtagTextRegex)
    const toolMatch = value.match(toolTextRegex)

    if (atMatch) {
      // setIsAssistantPickerOpen(true)
      // setAtCommand(atMatch[1])
    } else if (slashMatch) {
      setIsPromptPickerOpen(true)
      // setSlashCommand(slashMatch[1])
    } else if (hashtagMatch) {
      // setIsFilePickerOpen(true)
      // setHashtagCommand(hashtagMatch[1])
    } else if (toolMatch) {
      // setIsToolPickerOpen(true)
      // setToolCommand(toolMatch[1])
    } else {
      setIsPromptPickerOpen(false)
    }

    setUserInput(value)
  }

  const handleSelectPrompt = (prompt: Tables<"prompts">) => {
    setIsPromptPickerOpen(false)
    setUserInput(userInput.replace(/\/[^ ]*$/, "") + prompt.content)
  }
  
  return {
    handleInputChange,
    handleSelectPrompt,
  }
}
