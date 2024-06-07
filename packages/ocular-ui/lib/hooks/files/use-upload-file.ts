import * as React from "react";
import { toast } from "sonner";
import api from '@/services/admin-api';
import type { UploadedFile } from "@/types/types";

interface UseUploadFileProps {
  defaultUploadedFiles?: UploadedFile[];
}

export function useUploadFile(
  endpoint: string,
  { defaultUploadedFiles = [], ...props }: UseUploadFileProps = {}
) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>(defaultUploadedFiles);
  const [progresses, setProgresses] = React.useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFiles(files: File[]) {
    // const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    setIsUploading(true);
    try {
      // Ensure this code runs only on the client-side
      if (typeof window === 'undefined') {
        throw new Error("File upload can only be performed on the client-side");
      }

      const formData = new FormData();

      files.forEach(file => {
        console.log('File here:', file);
        if (file instanceof File) {
          formData.set('files', file);
          console.log(`Appended file: ${file.name}`);
        } else {
          console.error('Invalid file object:', file);
        }
      });



      const response = await api.files.upload(files);

      // Assuming the response contains the uploaded file details
      // setUploadedFiles((prev) => (prev ? [...prev, ...response.data] : response.data));
      toast.success(`${files.length} files uploaded successfully.`);
    } catch (err) {
      toast.error(`Failed to upload files: ${err.message}`);
    } finally {
      setProgresses({});
      setIsUploading(false);
    }
  }

  return {
    uploadedFiles,
    progresses,
    uploadFiles,
    isUploading,
  };
}
