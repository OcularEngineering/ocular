// import { useAdminStore } from "medusa-react"
import React, { useState } from "react"

import CartIcon from "../../fundamentals/icons/cart-icon"
import GearIcon from "../../fundamentals/icons/gear-icon"
import TagIcon from "../../fundamentals/icons/tag-icon"
import SidebarMenuItem from "../../molecules/sidebar-menu-item"
// import UserMenu from "../../molecules/user-menu"

const ICON_SIZE = 20

const Sidebar: React.FC = () => {
  const [currentlyOpen, setCurrentlyOpen] = useState(-1)
  // const { store } = useAdminStore()

  const triggerHandler = () => {
    const id = triggerHandler.id++
    return {
      open: currentlyOpen === id,
      handleTriggerClick: () => setCurrentlyOpen(id),
    }
  }
  // We store the `id` counter on the function object, as a state creates
  // infinite updates, and we do not want the variable to be free floating.
  triggerHandler.id = 0

  return (
    <div className="min-w-sidebar max-w-sidebar bg-gray-0 border-grey-20 py-base px-base h-screen overflow-y-auto border-r">
      <div className="h-full">
        <div className="flex justify-between px-2">
          <div className="rounded-circle flex h-8 w-8 items-center justify-center border border-solid border-gray-300">
            {/* <UserMenu /> */}
            <div>User Menu: Implement Once BackEnd Is Up</div>
          </div>
        </div>
        <div className="my-base flex flex-col px-2">
          <span className="text-grey-50 text-small font-medium">
            <div>DashBoard</div>
          </span>
          <span className="text-grey-90 text-medium font-medium">
            {/* {store?.name} */}
            <div>Request OrgName From BackEnd Once Logged In</div>
            <div>Org Name</div>
          </span>
        </div>
        <div className="py-3.5">
          <SidebarMenuItem
            pageLink={"/a/home"}
            icon={<CartIcon size={ICON_SIZE} />}
            triggerHandler={triggerHandler}
            text={"Home"}
          />
          <SidebarMenuItem
            pageLink={"/a/apps"}
            icon={<TagIcon size={ICON_SIZE} />}
            text={"Apps"}
            triggerHandler={triggerHandler}
          />
          <SidebarMenuItem
            pageLink={"/a/appstore"}
            icon={<TagIcon size={ICON_SIZE} />}
            text={"AppStore"}
            triggerHandler={triggerHandler}
          />
          <SidebarMenuItem
            pageLink={"/a/settings"}
            icon={<GearIcon size={ICON_SIZE} />}
            triggerHandler={triggerHandler}
            text={"Settings"}
          />
        </div>
      </div>
    </div>
  )
}

export default Sidebar
