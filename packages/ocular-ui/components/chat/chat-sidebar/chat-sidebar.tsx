import { ChatbotUIContext } from "@/context/context"
import { ContentType } from "@/types"
import { FC, useContext } from "react"
import { SIDEBAR_WIDTH } from "../../ui/dashboard"
import { TabsContent, Tabs } from "../../ui/tabs"
import { SidebarContent } from "./chat-sidebar-content"

interface SidebarProps {
  contentType: ContentType
  showSidebar: boolean
}

export const ChatSideBar: FC<SidebarProps> = ({contentType, showSidebar }) => {
  const {
    chats,
  } = useContext(ChatbotUIContext)


  const renderSidebarContent = (
    contentType: ContentType,
    data: any[],
  ) => {
    return (
      <SidebarContent contentType={contentType} data={data}/>
    )
  }

  return (
    <Tabs
      className="flex h-full"
      value={contentType}
      // onValueChange={tabValue => {
      //   setContentType(tabValue as ContentType)
      //   router.replace(`${pathname}?tab=${tabValue}`)
      // }}
    >
      <TabsContent
        className="m-0 w-full space-y-2"
        style={{
          minWidth: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)`: "0px",
          maxWidth: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)`: "0px",
          width: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)`: "0px"
        }}
        value={contentType}
      >
        <div className="flex h-full flex-col p-3 px-3">
          {(() => {
            switch (contentType) {
            
              case "chats":
                return renderSidebarContent("chats", chats)

              // case "presets":
              //   return renderSidebarContent("presets", presets, presetFolders)

              // case "prompts":
              //   return renderSidebarContent("prompts", prompts, promptFolders)

              // case "files":
              //   return renderSidebarContent("files", files, filesFolders)

              // case "collections":
              //   return renderSidebarContent(
              //     "collections",
              //     collections,
              //     collectionFolders
              //   )

              // case "assistants":
              //   return renderSidebarContent(
              //     "assistants",
              //     assistants,
              //     assistantFolders
              //   )

              // case "tools":
              //   return renderSidebarContent("tools", tools, toolFolders)

              // case "models":
              //   return renderSidebarContent("models", models, modelFolders)

              default:
                return null
            }
          })()}
        </div>
      </TabsContent>
    </Tabs>
  )
}