// TODO: Separate into multiple contexts, keeping simple for now

"use client"

import { ApplicationContext } from "@/context/context"
import  api  from "@/services/api"
import { DateRange } from "react-day-picker";
import { addDays, format as formatDateFns } from "date-fns"

import {
  Chat,
  ChatMessage
  // ChatFile,
  // ChatMessage,
  // ChatSettings,
  // LLM,
  // MessageImage,
  // OpenRouterLLM,
  // WorkspaceImage
} from "@/types/chat"
import { CancelTokenSource } from "axios"
// import { AssistantImage } from "@/types/images/assistant-image"
// import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"

interface GlobalStateProps {
  children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  const router = useRouter()

  // PROFILE STORE
  // const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)

  // ITEMS STORE
  // const [assistants, setAssistants] = useState<Tables<"assistants">[]>([])
  // const [collections, setCollections] = useState<Tables<"collections">[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  // const [files, setFiles] = useState<Tables<"files">[]>([])
  // const [folders, setFolders] = useState<Tables<"folders">[]>([])
  // const [models, setModels] = useState<Tables<"models">[]>([])
  // const [presets, setPresets] = useState<Tables<"presets">[]>([])
  // const [prompts, setPrompts] = useState<Tables<"prompts">[]>([])
  // const [tools, setTools] = useState<Tables<"tools">[]>([])
  // const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([])

  // MODELS STORE
  // const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({})
  // const [availableHostedModels, setAvailableHostedModels] = useState<LLM[]>([])
  // const [availableLocalModels, setAvailableLocalModels] = useState<LLM[]>([])
  // const [availableOpenRouterModels, setAvailableOpenRouterModels] = useState<
  //   OpenRouterLLM[]
  // >([])

  // // WORKSPACE STORE
  // const [selectedWorkspace, setSelectedWorkspace] =
  //   useState<Tables<"workspaces"> | null>(null)
  // const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([])

  // // PRESET STORE
  // const [selectedPreset, setSelectedPreset] =
  //   useState<Tables<"presets"> | null>(null)

  // // ASSISTANT STORE
  // const [selectedAssistant, setSelectedAssistant] =
  //   useState<Tables<"assistants"> | null>(null)
  // const [assistantImages, setAssistantImages] = useState<AssistantImage[]>([])
  // const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([])

  // // PASSIVE CHAT STORE
  const [userInput, setUserInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  // const [chatSettings, setChatSettings] = useState<ChatSettings>({
  //   model: "gpt-4-turbo-preview",
  //   prompt: "You are a helpful AI assistant.",
  //   temperature: 0.5,
  //   contextLength: 4000,
  //   includeProfileContext: true,
  //   includeWorkspaceInstructions: true,
  //   embeddingsProvider: "openai"
  // })
  const [selectedChat, setSelectedChat] = useState<Chat| null>(null)
  // const [chatFileItems, setChatFileItems] = useState<Tables<"file_items">[]>([])

  // ACTIVE CHAT STORE
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [firstTokenReceived, setFirstTokenReceived] = useState<boolean>(false)
  const [cancelTokenSource, setCancelTokenSource] =
    useState<CancelTokenSource | null>(null)

  // CHAT INPUT COMMAND STORE
  const [isPromptPickerOpen, setIsPromptPickerOpen] = useState(false)
  // const [slashCommand, setSlashCommand] = useState("")
  // const [isFilePickerOpen, setIsFilePickerOpen] = useState(false)
  // const [hashtagCommand, setHashtagCommand] = useState("")
  // const [isToolPickerOpen, setIsToolPickerOpen] = useState(false)
  // const [toolCommand, setToolCommand] = useState("")
  const [focusPrompt, setFocusPrompt] = useState(false)
  // const [focusFile, setFocusFile] = useState(false)
  // const [focusTool, setFocusTool] = useState(false)
  // const [focusAssistant, setFocusAssistant] = useState(false)
  // const [atCommand, setAtCommand] = useState("")
  // const [isAssistantPickerOpen, setIsAssistantPickerOpen] = useState(false)

  // // ATTACHMENTS STORE
  // const [chatFiles, setChatFiles] = useState<ChatFile[]>([])
  // const [chatImages, setChatImages] = useState<MessageImage[]>([])
  // const [newMessageFiles, setNewMessageFiles] = useState<ChatFile[]>([])
  // const [newMessageImages, setNewMessageImages] = useState<MessageImage[]>([])
  // const [showFilesDisplay, setShowFilesDisplay] = useState<boolean>(false)

  // // RETIEVAL STORE
  // const [useRetrieval, setUseRetrieval] = useState<boolean>(true)
  // const [sourceCount, setSourceCount] = useState<number>(4)

  // // TOOL STORE
  // const [selectedTools, setSelectedTools] = useState<Tables<"tools">[]>([])
  // const [toolInUse, setToolInUse] = useState<string>("none")

  // Search Results Sources Store
  const [selectedResultSources, setselectedResultSources] = useState<string[]>([])
  const [resultSources, setResultSources] = useState<string[]>([])

  const [activeFilter, setActiveFilter] = useState('all');

  // const [resultFilterDate, setResultFilterDate] = useState<DateRange | undefined>({
  //   from: new Date(), // You can set initial values here
  //   to: new Date(),
  // });

  const [resultFilterDate, setResultFilterDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  useEffect(() => {
    ;(async () => {
      // const profile = await fetchStartingChatData()
      await fetchStartingChatData()
      // if (profile) {
      //   // const hostedModelRes = await fetchHostedModels(profile)
      //   // if (!hostedModelRes) return

      //   setEnvKeyMap(hostedModelRes.envKeyMap)
      //   setAvailableHostedModels(hostedModelRes.hostedModels)

      //   if (
      //     profile["openrouter_api_key"] ||
      //     hostedModelRes.envKeyMap["openrouter"]
      //   ) {
      //     const openRouterModels = await fetchOpenRouterModels()
      //     if (!openRouterModels) return
      //     setAvailableOpenRouterModels(openRouterModels)
      //   }
      // }

      // if (process.env.NEXT_PUBLIC_OLLAMA_URL) {
      //   const localModels = await fetchOllamaModels()
      //   if (!localModels) return
      //   setAvailableLocalModels(localModels)
      // }
    })()
  }, [])

  const fetchStartingChatData = async () => {
    const user = await (await api.auth.loggedInUserDetails()).data.user

    // if (user) {
    //   const user = session.user

    //   const profile = await getProfileByUserId(user.id)
    //   setProfile(profile)

    //   if (!profile.has_onboarded) {
    //     return router.push("/setup")
    //   }

    //   const workspaces = await getWorkspacesByUserId(user.id)
    //   setWorkspaces(workspaces)

    //   for (const workspace of workspaces) {
    //     let workspaceImageUrl = ""

    //     if (workspace.image_path) {
    //       workspaceImageUrl =
    //         (await getWorkspaceImageFromStorage(workspace.image_path)) || ""
    //     }

    //     if (workspaceImageUrl) {
    //       const response = await fetch(workspaceImageUrl)
    //       const blob = await response.blob()
    //       const base64 = await convertBlobToBase64(blob)

    //       setWorkspaceImages(prev => [
    //         ...prev,
    //         {
    //           workspaceId: workspace.id,
    //           path: workspace.image_path,
    //           base64: base64,
    //           url: workspaceImageUrl
    //         }
    //       ])
    //     }
    //   }

    //   return profile
    // }
  }

  return (
    <ApplicationContext.Provider
      value={{
        // // PROFILE STORE
        // profile,
        // setProfile,

        // // ITEMS STORE
        // assistants,
        // setAssistants,
        // collections,
        // setCollections,
        chats,
        setChats,
        selectedResultSources,
        setselectedResultSources,
        resultSources,
        setResultSources,
        activeFilter,
        setActiveFilter,
        resultFilterDate,
        setResultFilterDate,
        // files,
        // setFiles,
        // folders,
        // setFolders,
        // models,
        // setModels,
        // presets,
        // setPresets,
        // prompts,
        // setPrompts,
        // tools,
        // setTools,
        // workspaces,
        // setWorkspaces,

        // MODELS STORE
        // envKeyMap,
        // setEnvKeyMap,
        // availableHostedModels,
        // setAvailableHostedModels,
        // availableLocalModels,
        // setAvailableLocalModels,
        // availableOpenRouterModels,
        // setAvailableOpenRouterModels,

        // WORKSPACE STORE
        // selectedWorkspace,
        // setSelectedWorkspace,
        // workspaceImages,
        // setWorkspaceImages,

        // // PRESET STORE
        // selectedPreset,
        // setSelectedPreset,

        // // ASSISTANT STORE
        // selectedAssistant,
        // setSelectedAssistant,
        // assistantImages,
        // setAssistantImages,
        // openaiAssistants,
        // setOpenaiAssistants,

        // // PASSIVE CHAT STORE
        userInput,
        setUserInput,
        chatMessages,
        setChatMessages,
        // chatSettings,
        // setChatSettings,
        selectedChat,
        setSelectedChat,
        // chatFileItems,
        // setChatFileItems,

        // // ACTIVE CHAT STORE
        isGenerating,
        setIsGenerating,
        // firstTokenReceived,
        setFirstTokenReceived,
        cancelTokenSource,
        setCancelTokenSource,
      

        // CHAT INPUT COMMAND STORE
        isPromptPickerOpen,
        setIsPromptPickerOpen,
        // slashCommand,
        // setSlashCommand,
        // isFilePickerOpen,
        // setIsFilePickerOpen,
        // hashtagCommand,
        // setHashtagCommand,
        // isToolPickerOpen,
        // setIsToolPickerOpen,
        // toolCommand,
        // setToolCommand,
        focusPrompt,
        setFocusPrompt,
        // focusFile,
        // setFocusFile,
        // focusTool,
        // setFocusTool,
        // focusAssistant,
        // setFocusAssistant,
        // atCommand,
        // setAtCommand,
        // isAssistantPickerOpen,
        // setIsAssistantPickerOpen,

        // // ATTACHMENT STORE
        // chatFiles,
        // setChatFiles,
        // chatImages,
        // setChatImages,
        // newMessageFiles,
        // setNewMessageFiles,
        // newMessageImages,
        // setNewMessageImages,
        // showFilesDisplay,
        // setShowFilesDisplay,

        // // RETRIEVAL STORE
        // useRetrieval,
        // setUseRetrieval,
        // sourceCount,
        // setSourceCount,

        // // TOOL STORE
        // selectedTools,
        // setSelectedTools,
        // toolInUse,
        // setToolInUse
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}