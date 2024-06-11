"use client";

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


import SectionContainer from "@/components/section-container"
import { UploadedFilesCard } from "@/components/files/uploaded-files-card"
import { useUploadFile } from "@/lib/hooks/files/use-upload-file"
import { FileUploader } from "@/components/files/file-uploader"

export default function FilesDialog({ link }) {
  const router = useRouter();
  const isActive = (href) => router.pathname === href;

  const { uploadFiles, progresses, uploadedFiles, isUploading } = useUploadFile(
    "fileUploader",
    { defaultUploadedFiles: [] }
  )

  return (
    <Dialog>
      <Tooltip>
        <div className="flex items-center space-x-3">
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer">
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
              </div>
            </DialogTrigger>
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

      <DialogContent className="flex flex-col w-[60vw] h-[90vh] max-h-[90vh] justify-between overflow-auto">

        <UploadedFilesCard uploadedFiles={uploadedFiles} />

        <DialogFooter className="justify-end sticky bottom-0">
          <FileUploader
            maxFiles={Infinity}
            maxSize={Infinity}
            progresses={progresses}
            onUpload={uploadFiles}
            disabled={isUploading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
