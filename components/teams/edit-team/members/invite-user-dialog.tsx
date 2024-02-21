
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Toaster } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    toast.success("User was invited", { duration: 1500 });
  }
  
  return (
    <>
      <Dialog open={isOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>
            Invite to team
          </Button>
        </DialogTrigger>
        <DialogContent className="space-y-5 sm:max-w-[500px]">
          <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <form>
            <div className="flex flex-col space-y-5">
              <Input id="emails" placeholder="Enter emails" className="col-span-3" />
              <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Admin">Team Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </form>
          <DialogFooter>
            <Button type="submit" className="bg-white text-black hover:bg-muted" onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={handleSubmitAndClose}>Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
