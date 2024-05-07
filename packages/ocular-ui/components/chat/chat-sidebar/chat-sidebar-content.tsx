import { ContentType, DataListType } from "@/types"
import { FC, useState } from "react"
// import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { SidebarDataList } from "./chat-sidebar-data-list"
// import { SidebarSearch } from "./sidebar-search"

interface SidebarContentProps {
  contentType: ContentType
  data: DataListType
}

export const SidebarContent: FC<SidebarContentProps> = ({
  contentType,
  data
}) => {
  // const [searchTerm, setSearchTerm] = useState("")

  // console.log('filteredData in chat-sidebar-content.tsx', data)
  // const filteredData: any = data.filter(item =>
  //   item.name.toLowerCase().includes(searchTerm.toLowerCase())
  // )

  // console.log('filteredData in chat-sidebar-content.tsx', filteredData)

  return (
    // Subtract 50px for the height of the workspace settings
    <div className="flex max-h-[calc(100%-10px)] grow flex-col w-[350px] overflow-y-auto scrollbar-custom">
      {/* <div className="mt-2 flex items-center">
      //   <SidebarCreateButtons
      //     contentType={contentType}
      //     hasData={data.length > 0}
      //   />
      // </div> */}

      {/* <div className="mt-2">
        <SidebarSearch
          contentType={contentType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div> */}

      <SidebarDataList
        contentType={contentType}
        data={data}
      />
    </div>
  )
}