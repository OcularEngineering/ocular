
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { User } from "@/data/schema"
import { X } from 'lucide-react';
import { toast, Toaster } from "sonner"
import EditUserLayout from "@/components/members/edit-user/edit-user-layout"
import { EditUserTabs } from "./edit-user-tabs"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

interface EditUserDialogProps {
  user: User;
}

export function EditUserDialog({user}: EditUserDialogProps) {
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
          <div className="flex items-center space-x-4 w-[150px] cursor-pointer" onClick={() => setIsOpen(true)}>
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-sm font-medium leading-none hover:font-bold hover:text-blue-500">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
         </div>
        </DialogTrigger>
        <DialogContent className="space-y-5 sm:max-w-[700px]">
          <DialogHeader>
              <DialogTitle>
                <div className='flex flex-row justify-between flex-grow'>
                  {user.first_name}'s settings
                  <X size={20} className="cursor-pointer" onClick={() => setIsOpen(false)} />
                </div>
              </DialogTitle>
          </DialogHeader>
          <form>
            <EditUserLayout>
              <div className="flex flex-col">
                <EditUserTabs user={user} />
              </div>
            </EditUserLayout>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
