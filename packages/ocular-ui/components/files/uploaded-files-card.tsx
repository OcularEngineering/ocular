import Image from "next/image"
import type { Files } from "@/types/types"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { EmptyCard } from "@/components/files/empty-card"

interface UploadedFilesCardProps {
  uploadedFiles: Files[]
}

export function UploadedFilesCard({ uploadedFiles }: UploadedFilesCardProps) {

  console.log("File Object: ", uploadedFiles)
  return (
    <div>
      {uploadedFiles.length > 0 ? (
        <ScrollArea className="pb-4">
          <div className="flex flex-col space-y-4">
            {uploadedFiles.map((file, key) => (
              <div key={key} className="flex items-center space-x-4 p-4 hover:bg-gray-100/50 rounded-2xl">
                <div className="w-12 h-12 bg-gray-100 rounded-xl relative">
                  {/* <Image
                    src={""}
                    alt={file.title}
                    fill
                    sizes="(min-width: 640px) 640px, 100vw"
                    loading="lazy"
                    className="rounded-md object-cover"
                  /> */}
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-md font-semibold text-gray-800">{file.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      ) : (
        <EmptyCard
          title="No files uploaded"
          description="Upload some files to see them here"
          className="w-full"
        />
      )}
    </div>
  )
}
