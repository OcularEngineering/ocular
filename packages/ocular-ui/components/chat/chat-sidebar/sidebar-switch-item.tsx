import { ContentType } from "@/types"
import { FC } from "react"
import { TabsTrigger } from "@/components/ui/tabs"

interface SidebarSwitchItemProps {
  contentType: ContentType
  icon: React.ReactNode
  name: string
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitchItem: FC<SidebarSwitchItemProps> = ({
  contentType,
  icon,
  name,
  onContentTypeChange
}) => {
  return (
    <TabsTrigger
      className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 text-muted-foreground inline-flex h-9 w-[200px] items-center justify-between px-5 text-left"
      value={contentType}
      style={{ borderRadius: "40px 40px 40px 40px" }}
      onClick={() => onContentTypeChange(contentType as ContentType)}
    >

      <div className="flex items-start justify-start text-left">{name}</div>
      {icon}
    </TabsTrigger>
  )
}
