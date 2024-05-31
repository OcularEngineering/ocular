// import { Tables } from "@/supabase/types"
import {
  ChatFile,
  ChatMessage,
  ChatSettings,
  Chat
} from "@/types/chat"
import { CancelToken, CancelTokenSource } from "axios"
import { da } from "date-fns/locale"
// import { AssistantImage } from "@/types/images/assistant-image"
// import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { Dispatch, SetStateAction, createContext } from "react"
import { DateRange } from "react-day-picker"
import { Profile } from "@/types/types";

interface ApplicationContext {
  // PROFILE STORE
  profile: Profile | null
  setProfile: Dispatch<SetStateAction<Profile | null>>

  // // ITEMS STORE
  // assistants: Tables<"assistants">[]
  // setAssistants: Dispatch<SetStateAction<Tables<"assistants">[]>>
  // collections: Tables<"collections">[]
  // setCollections: Dispatch<SetStateAction<Tables<"collections">[]>>
  chats: Chat[]
  setChats: Dispatch<SetStateAction<Chat[]>>
  // files: Tables<"files">[]
  // setFiles: Dispatch<SetStateAction<Tables<"files">[]>>
  // folders: Tables<"folders">[]
  // setFolders: Dispatch<SetStateAction<Tables<"folders">[]>>
  // models: Tables<"models">[]
  // setModels: Dispatch<SetStateAction<Tables<"models">[]>>
  // presets: Tables<"presets">[]
  // setPresets: Dispatch<SetStateAction<Tables<"presets">[]>>
  // prompts: Tables<"prompts">[]
  // setPrompts: Dispatch<SetStateAction<Tables<"prompts">[]>>
  // tools: Tables<"tools">[]
  // setTools: Dispatch<SetStateAction<Tables<"tools">[]>>
  // workspaces: Tables<"workspaces">[]
  // setWorkspaces: Dispatch<SetStateAction<Tables<"workspaces">[]>>

  // // WORKSPACE STORE
  // selectedWorkspace: Tables<"workspaces"> | null
  // setSelectedWorkspace: Dispatch<SetStateAction<Tables<"workspaces"> | null>>
  // // workspaceImages: WorkspaceImage[]
  // // setWorkspaceImages: Dispatch<SetStateAction<WorkspaceImage[]>>

  // // PRESET STORE
  // selectedPreset: Tables<"presets"> | null
  // setSelectedPreset: Dispatch<SetStateAction<Tables<"presets"> | null>>

  // // ASSISTANT STORE
  // selectedAssistant: Tables<"assistants"> | null
  // setSelectedAssistant: Dispatch<SetStateAction<Tables<"assistants"> | null>>
  // // assistantImages: AssistantImage[]
  // // setAssistantImages: Dispatch<SetStateAction<AssistantImage[]>>
  // openaiAssistants: any[]
  // setOpenaiAssistants: Dispatch<SetStateAction<any[]>>

  // // PASSIVE CHAT STORE
  userInput: string
  setUserInput: Dispatch<SetStateAction<string>>
  chatMessages: ChatMessage[]
  setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>
  // chatSettings: ChatSettings | null
  // setChatSettings: Dispatch<SetStateAction<ChatSettings>>
  selectedChat: Chat | null
  setSelectedChat: Dispatch<SetStateAction<Chat|null>>
  // chatFileItems: Tables<"file_items">[]
  // setChatFileItems: Dispatch<SetStateAction<Tables<"file_items">[]>>

  // // ACTIVE CHAT STORE
  cancelTokenSource: CancelTokenSource | null
  setCancelTokenSource: Dispatch<SetStateAction<CancelTokenSource | null>>
  firstTokenReceived: boolean
  setFirstTokenReceived: Dispatch<SetStateAction<boolean>>
  isGenerating: boolean
  setIsGenerating: Dispatch<SetStateAction<boolean>>

  // // CHAT INPUT COMMAND STORE
  isPromptPickerOpen: boolean
  setIsPromptPickerOpen: Dispatch<SetStateAction<boolean>>
  // slashCommand: string
  // setSlashCommand: Dispatch<SetStateAction<string>>
  // isFilePickerOpen: boolean
  // setIsFilePickerOpen: Dispatch<SetStateAction<boolean>>
  // hashtagCommand: string
  // setHashtagCommand: Dispatch<SetStateAction<string>>
  // isToolPickerOpen: boolean
  // setIsToolPickerOpen: Dispatch<SetStateAction<boolean>>
  // toolCommand: string
  // setToolCommand: Dispatch<SetStateAction<string>>
  focusPrompt: boolean
  setFocusPrompt: Dispatch<SetStateAction<boolean>>
  // focusFile: boolean
  // setFocusFile: Dispatch<SetStateAction<boolean>>
  // focusTool: boolean
  // setFocusTool: Dispatch<SetStateAction<boolean>>
  // focusAssistant: boolean
  // setFocusAssistant: Dispatch<SetStateAction<boolean>>
  // atCommand: string
  // setAtCommand: Dispatch<SetStateAction<string>>
  // isAssistantPickerOpen: boolean
  // setIsAssistantPickerOpen: Dispatch<SetStateAction<boolean>>

  // // ATTACHMENTS STORE
  // chatFiles: ChatFile[]
  // setChatFiles: Dispatch<SetStateAction<ChatFile[]>>
  // // chatImages: MessageImage[]
  // // setChatImages: Dispatch<SetStateAction<MessageImage[]>>
  // newMessageFiles: ChatFile[]
  // setNewMessageFiles: Dispatch<SetStateAction<ChatFile[]>>
  // // newMessageImages: MessageImage[]
  // // setNewMessageImages: Dispatch<SetStateAction<MessageImage[]>>
  // showFilesDisplay: boolean
  // setShowFilesDisplay: Dispatch<SetStateAction<boolean>>

  // // RETRIEVAL STORE
  // useRetrieval: boolean
  // setUseRetrieval: Dispatch<SetStateAction<boolean>>
  // sourceCount: number
  // setSourceCount: Dispatch<SetStateAction<number>>

  // // TOOL STORE
  // selectedTools: Tables<"tools">[]
  // setSelectedTools: Dispatch<SetStateAction<Tables<"tools">[]>>
  // toolInUse: string
  // setToolInUse: Dispatch<SetStateAction<string>>

    // RESULT SOURCES STORE
    selectedResultSources: string[]
    setselectedResultSources: Dispatch<SetStateAction<string[]>>

    resultSources: string[]
    setResultSources: Dispatch<SetStateAction<string[]>>

    activeFilter: string
    setActiveFilter: Dispatch<SetStateAction<string>>

    resultFilterDate: DateRange | undefined;
    setResultFilterDate: Dispatch<SetStateAction<DateRange | undefined>>;
}

export const ApplicationContext = createContext<ApplicationContext>({
  // PROFILE STORE
  profile: null,
  setProfile: () => {},

//   // ITEMS STORE
//   assistants: [],
//   setAssistants: () => {},
//   collections: [],
//   setCollections: () => {},
  chats: [],
  setChats: () => {},
//   files: [],
//   setFiles: () => {},
//   folders: [],
//   setFolders: () => {},
//   models: [],
//   setModels: () => {},
//   presets: [],
//   setPresets: () => {},
//   prompts: [],
//   setPrompts: () => {},
//   tools: [],
//   setTools: () => {},
//   workspaces: [],
//   setWorkspaces: () => {},

//   // MODELS STORE
//   // envKeyMap: {},
//   // setEnvKeyMap: () => {},
//   // availableHostedModels: [],
//   // setAvailableHostedModels: () => {},
//   // availableLocalModels: [],
//   // setAvailableLocalModels: () => {},
//   // availableOpenRouterModels: [],
//   // setAvailableOpenRouterModels: () => {},

//   // WORKSPACE STORE
//   selectedWorkspace: null,
//   setSelectedWorkspace: () => {},
//   // workspaceImages: [],
//   // setWorkspaceImages: () => {},

//   // PRESET STORE
//   selectedPreset: null,
//   setSelectedPreset: () => {},

//   // ASSISTANT STORE
//   selectedAssistant: null,
//   setSelectedAssistant: () => {},
//   // assistantImages: [],
//   // setAssistantImages: () => {},
//   openaiAssistants: [],
//   setOpenaiAssistants: () => {},

//   // PASSIVE CHAT STORE
  userInput: "",
  setUserInput: () => {},
  selectedChat: null,
  setSelectedChat: () => {},
  chatMessages: [],
  setChatMessages: () => {},
//   chatSettings: null,
//   // setChatSettings: () => {},
//   chatFileItems: [],
//   setChatFileItems: () => {},

//   // ACTIVE CHAT STORE
  isGenerating: false,
  setIsGenerating: () => {},
  firstTokenReceived: false,
  setFirstTokenReceived: () => {},
  cancelTokenSource: null,
  setCancelTokenSource: () => {},

//   // CHAT INPUT COMMAND STORE
  isPromptPickerOpen: false,
  setIsPromptPickerOpen: () => {},
//   slashCommand: "",
//   setSlashCommand: () => {},
//   isFilePickerOpen: false,
//   setIsFilePickerOpen: () => {},
//   hashtagCommand: "",
//   setHashtagCommand: () => {},
//   isToolPickerOpen: false,
//   setIsToolPickerOpen: () => {},
//   toolCommand: "",
//   setToolCommand: () => {},
  focusPrompt: false,
  setFocusPrompt: () => {},
//   focusFile: false,
//   setFocusFile: () => {},
//   focusTool: false,
//   setFocusTool: () => {},
//   focusAssistant: false,
//   setFocusAssistant: () => {},
//   atCommand: "",
//   setAtCommand: () => {},
//   isAssistantPickerOpen: false,
//   setIsAssistantPickerOpen: () => {},

//   // ATTACHMENTS STORE
//   chatFiles: [],
//   setChatFiles: () => {},
//   // chatImages: [],
//   // setChatImages: () => {},
//   newMessageFiles: [],
//   setNewMessageFiles: () => {},
//   // newMessageImages: [],
//   // setNewMessageImages: () => {},
//   showFilesDisplay: false,
//   setShowFilesDisplay: () => {},

//   // RETRIEVAL STORE
//   useRetrieval: false,
//   setUseRetrieval: () => {},
//   sourceCount: 4,
//   setSourceCount: () => {},

//   // TOOL STORE
//   selectedTools: [],
//   setSelectedTools: () => {},
//   toolInUse: "none",
//   setToolInUse: () => {}

  // RESULT SOURCES STORE
  selectedResultSources: [],
  setselectedResultSources: () => {},
  resultSources: [],
  setResultSources: () => {},
  activeFilter: "",
  setActiveFilter: () => {},
  resultFilterDate: undefined,
  setResultFilterDate: () => {}
})
