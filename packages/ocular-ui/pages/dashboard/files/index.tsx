import SectionContainer from "@/components/section-container"
import { UploadedFilesCard } from "@/components/files/uploaded-files-card"
import { useUploadFile } from "@/lib/hooks/files/use-upload-file"
import { FileUploader } from "@/components/files/file-uploader"

export default function Files() {
  const { uploadFiles, progresses, uploadedFiles, isUploading } = useUploadFile(
    "fileUploader",
    { defaultUploadedFiles: [] }
  )

  return (
    <SectionContainer className="space-y-6 mt-10">
      <FileUploader
        maxFiles={Infinity}
        maxSize={Infinity}
        progresses={progresses}
        onUpload={uploadFiles}
        disabled={isUploading}
      />
      <UploadedFilesCard uploadedFiles={uploadedFiles} />
    </SectionContainer>
  )
}


 