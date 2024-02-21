
import React, { useState } from 'react';
import { toast, Toaster } from "sonner"
import EditTeamLayout from "@/components/teams/edit-team/edit-team-layout"
import { EditTeamTabs } from "./edit-team-tabs"
import { X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Team } from "@/data/schema"

interface EditTeamDialogProps {
  team: Team;
}

export function EditTeamDialog({team}: EditTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmitAndClose = () => {
    handleSubmit();
    handleClose();
  };

  const handleSubmit = () => {
    toast.success("User was invited", { duration: 1500 });
  }
  
  return (
    <>
      <Dialog open={isOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center space-x-4 w-[300px] cursor-pointer" onClick={() => setIsOpen(true)}>
              <p className="text-sm font-medium leading-none hover:font-bold hover:text-blue-500">{team.name}</p>
          </div>
        </DialogTrigger>
        <DialogContent className="space-y-5 sm:max-w-[700px]">
          <DialogHeader>
              <DialogTitle>
                <div className='flex flex-row justify-between flex-grow'>
                  {team.name}'s settings
                  <X size={20} className="cursor-pointer" onClick={() => setIsOpen(false)} />
                </div>
              </DialogTitle>
          </DialogHeader>
          <form>
            <EditTeamLayout>
              <div className="flex flex-col">
                <EditTeamTabs team={team} />
              </div>
            </EditTeamLayout>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
