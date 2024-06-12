import Image from "next/image"
import type { Files } from "@/types/types"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { EmptyCard } from "@/components/files/empty-card"

interface UploadedFilesCardProps {
  uploadedFiles: Files[]
}

export function UploadedFilesCard({ uploadedFiles }: UploadedFilesCardProps) {

  return (
    <div>
      {uploadedFiles.length > 0 ? (
        <ScrollArea className="pb-4">
          <div className="flex flex-col space-y-4">
            {uploadedFiles.map((file, key) => (
              <div key={key} className="flex items-center space-x-4 p-4 hover:bg-muted/30 rounded-2xl">
                <div className="w-12 h-12 bg-muted rounded-xl relative"/>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{file.title}</p>
                  <div className='flex flex-row gap-2'>
                    <p className="font-regular line-clamp-3 text-xs text-gray-500">
                    {
                      !isNaN(new Date(file.created_at).getTime()) ?
                      new Date(file.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) 
                      : null
                    }
                    </p>
                    <span className="font-regular text-xs text-gray-500">·</span>
                    <p className="font-regular line-clamp-3 text-xs text-gray-500">
                      {file.type.toUpperCase()}
                    </p>
                   </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      ) : (
        <EmptyCard
          title="No files uploaded"
          description="This is where you'll see all uploaded files"
          className="w-full"
        />
      )}
    </div>
  )
}
