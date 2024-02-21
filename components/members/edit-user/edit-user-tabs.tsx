import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs"

import { ProfileForm } from "./profile-form"
import { TeamAccessForm } from "./team-access-form"
import { SecurityForm } from "./security-form"
import { User } from "@/data/schema"

interface EditUserTabsProps {
    user: User;
}
  
export function EditUserTabs({user}: EditUserTabsProps) {

    return (
        <Tabs defaultValue="profile" className="w-[300px] justify-start items-start p-2 space-y-5">
            <TabsList className="flex flex-row w-full justify-start items-start gap-0">
                <TabsTrigger className="w-[100px]" value="profile">Profile</TabsTrigger>
                <TabsTrigger className="w-[100px]" value="teamAccess">Team Access</TabsTrigger>
                <TabsTrigger className="w-[100px]" value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="w-[630px]">
                <ProfileForm user={user} />
            </TabsContent>

            <TabsContent value="teamAccess" className="w-[630px]">
                <TeamAccessForm user={user} />
            </TabsContent>

            <TabsContent value="security" className="w-[630px]">
                <SecurityForm user={user} />
            </TabsContent>
        </Tabs>
    )
}