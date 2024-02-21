
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast, Toaster } from "sonner"

export function InviteUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmitAndClose = () => {
    handleSubmit();
    handleClose();
  };

  const handleSubmit = () => {
    toast.success("Team was added", { duration: 1500 });
  }
  
  return (
    <>
      <Dialog open={isOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>
            Add Team
          </Button>
        </DialogTrigger>
        <DialogContent className="space-y-5 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add new Team</DialogTitle>
          </DialogHeader>
          <form className='space-y-5'>
            <div className="flex flex-col space-y-1">
              <h3 className="text-md font-semibold">Team Name</h3>
              <Input id="teamName" placeholder="For example: Enginering or Design" className="col-span-3" />
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="text-md font-semibold">Description</h3>
              <Textarea id="teamDescription" placeholder="Add some detail about your team" className="col-span-3" />
            </div>
          </form>
          <DialogFooter>
            <Button type="submit" className="bg-white text-black hover:bg-muted" onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={handleSubmitAndClose}>Add Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
