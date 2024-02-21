
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/services/admin-api';

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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Toaster } from "sonner"

const formSchema = z.object({
  email: z.string().email("Please enter a valid work email."),
  role: z.string(),
});

interface Invite {
  email: string;
  role: string;

}

export function InviteUserDialog() {
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: Invite) => {
    try {
      console.log("Data Here:", data);
      await api.invites.create(data);
      toast.success("User invited successfully");
      setIsOpen(false); 
      reset(); 
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Invite User</Button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-5">
              <Input 
                {...register("email")} 
                placeholder="Enter email" 
                className="col-span-3"
              />
              <div className="w-[110px]">
                <Select
                  onValueChange={value => setValue("role", value)}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Role</SelectLabel>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Invite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}