import SectionContainer from "@/components/section-container"
import { UploadedFilesCard } from "@/components/files/uploaded-files-card"
import { useUploadFile } from "@/lib/hooks/files/use-upload-file"

export default function Files() {
  const { uploadFiles, progresses, uploadedFiles, isUploading } = useUploadFile(
    "imageUploader",
    { defaultUploadedFiles: [] }
  )

  return (
    <SectionContainer>
      <UploadedFilesCard uploadedFiles={uploadedFiles} />
    </SectionContainer>
  )
}
