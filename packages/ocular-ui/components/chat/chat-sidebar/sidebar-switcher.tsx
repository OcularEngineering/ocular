import { ContentType } from "@/types"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconFile,
  IconMessages,
  IconPencil,
  IconRobot,
  IconSparkles,
  IconFiles,
  IconHistory
} from "@tabler/icons-react"
import { FC } from "react"
import { TabsList } from "@/components/ui/tabs"
import { SidebarSwitchItem } from "./sidebar-switch-item"

export const SIDEBAR_ICON_SIZE = 20

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  return (
    <div className="flex flex-col justify-start h-screen">
      <TabsList className="flex bg-transparent justify-start h-screen flex-col space-y-2 p-3 mt-3 border-r">
        <SidebarSwitchItem
          icon={<IconHistory size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          name="History"
          onContentTypeChange={onContentTypeChange}
        />

        {/* <SidebarSwitchItem
          icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}
          contentType="presets"
          onContentTypeChange={onContentTypeChange}
        /> */}

        {/* <SidebarSwitchItem
          icon={<IconPencil size={SIDEBAR_ICON_SIZE} />}
          contentType="prompts"
          onContentTypeChange={onContentTypeChange}
        /> */}

        {/* <SidebarSwitchItem
          icon={<IconSparkles size={SIDEBAR_ICON_SIZE} />}
          contentType="models"
          onContentTypeChange={onContentTypeChange}
        /> */}

        {/* <SidebarSwitchItem
          icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
          contentType="files"
          name="Files"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconFiles size={SIDEBAR_ICON_SIZE} />}
          contentType="collections"
          name="Collections"
          onContentTypeChange={onContentTypeChange}
        /> */}

        {/* <SidebarSwitchItem
          icon={<IconRobot size={SIDEBAR_ICON_SIZE} />}
          contentType="assistants"
          name="Assistants"
          onContentTypeChange={onContentTypeChange}
        /> */}

        {/* <SidebarSwitchItem
          icon={<IconBolt size={SIDEBAR_ICON_SIZE} />}
          contentType="tools"
          onContentTypeChange={onContentTypeChange}
        /> */}
      </TabsList>
    </div>
  )
}
