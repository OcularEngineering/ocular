"use client";

import Link from "next/link";
import { useRouter } from 'next/router';
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  File
} from "lucide-react"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FilesDialog({ link }) {
  const router = useRouter();
  const isActive = (href) => router.pathname === href;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Tooltip delayDuration={0}>
          <div className="flex items-center space-x-3">
            <TooltipTrigger asChild>
              <div
                className={`${
                  buttonVariants({ variant: link.variant, size: "icon" })
                } h-9 w-9 ${
                  isActive(link.link) ? 'bg-accent rounded-md' : 'bg-transparent'
                } ${
                  link.variant === "default" && "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                }`}
              >
                <File style={{ height: '19px', width: '19px' }} /> 
                <span className="sr-only">{link.title}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-4">
              {link.title}
              {link.label && (
                <span className="text-muted-foreground ml-auto">
                  {link.label}
                </span>
              )}
            </TooltipContent>
          </div>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue="https://ui.shadcn.com/docs/installation"
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
