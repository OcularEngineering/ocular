export interface Announcement {
  id: string
  title: string
  content: string
  read: boolean
  link: string
  date: string
}

export interface AssistantRetrievalItem {
  id: string
  name: string
  type: string
}

export interface Chat{
  id: string
  name: string
  created_at: Date
  updated_at: Date
  organisation_id: string
  user_id: string
}

export interface Message {
  id: string
  content: string
  role: string
  chat_id: string
  user_id: string // Add this line
  created_at: Date
  updated_at: Date
}

export interface ChatFile {
  id: string
  name: string
  type: string
  file: File | null
}


export interface ChatMessage {
  message: Message
  fileItems: string[]
}


// export interface ChatSettings {
//   prompt: string
//   temperature: number
//   contextLength: number
//   includeProfileContext: boolean
//   includeWorkspaceInstructions: boolean
//   embeddingsProvider: "openai" | "local"
// }

export interface ChatPayload {
  chatSettings: ChatSettings
  workspaceInstructions: string
  chatMessages: ChatMessage[]
  // assistant: Tables<"assistants"> | null
  // messageFileItems: Tables<"file_items">[]
  // chatFileItems: Tables<"file_items">[]
}

export interface ChatAPIPayload {
  chatSettings: ChatSettings
  // messages: Tables<"messages">[]
}

export interface CollectionFile {
  id: string
  name: string
  type: string
}

export type ContentType =
  | "chats"
  | "presets"
  | "prompts"
  | "files"
  | "collections"
  | "assistants"
  | "tools"
  | "models"


  export type FileItemChunk = {
    content: string
    tokens: number
  }

  
  export type Sharing = "private" | "public" | "unlisted"

