
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast, Toaster } from "sonner"
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import api from "@/services/admin-api"

type FormValues = {
  name: string;
};

export function CreateTeamDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [member_emails, setmember_emails] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleEmailsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const emails = event.target.value.split(';');
    setmember_emails(emails);
  };

  const onSubmit = async (data: FormValues) => {

    console.log("Data: ", data);

    try {
      const payload = {
        name: data.name,
        member_emails: member_emails,
      };
      console.log("Payload: ", payload);

      const response = await api.teams.create(payload);
      toast.success("Team was added successfully");
      handleClose();
      console.log("Team was added:", response);

    } catch (error) {
      console.error("Error adding team:", error);
    }
  };
  
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
          <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-1">
              <h3 className="text-md font-semibold">Team Name</h3>
              <Input 
                id="teamName" 
                placeholder="For example: Enginering or Design" 
                className="col-span-3" 
                {...register("name", { required: true })}
              />
              {errors.name && <p>Name is required.</p>}
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="text-md font-semibold">Add Members</h3>
              <Textarea 
                id="teamDescription" 
                placeholder="Add members to your team by emails. Separate emails with semicolon." 
                className="col-span-3" 
                onChange={handleEmailsChange}
              />
            </div>
            <Button type="submit" className="bg-white text-black hover:bg-muted" onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add Team</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
