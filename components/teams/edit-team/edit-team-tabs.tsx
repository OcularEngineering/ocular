import { GeneralForm } from "./general-form"
import { MembersForm } from "./members-form"
import { Team } from "@/data/schema"

import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs"

interface EditUserTabsProps {
    team: Team;
}
  
export function EditTeamTabs({team}: EditUserTabsProps) {

    return (
        <Tabs defaultValue="general" className="w-[200px] justify-start items-start p-2 space-y-5">
            <TabsList className="flex flex-row w-full justify-start items-start gap-0">
                <TabsTrigger className="w-[100px]" value="general">General</TabsTrigger>
                <TabsTrigger className="w-[100px]" value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="w-[630px]">
                <GeneralForm team={team} />
            </TabsContent>

            <TabsContent value="members" className="w-[630px]">
                <MembersForm team={team} />
            </TabsContent>

        </Tabs>
    )
}