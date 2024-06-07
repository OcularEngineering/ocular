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

        if (file instanceof File) {

          formData.append('files', file);

        } else {

          console.error('Invalid file object:', file);

        }
      });

      const response = await api.files.upload(files);

      setUploadedFiles((prev) => (prev ? [...prev, ...response.data.uploads] : response.data.uploads));
      toast.success(`${files.length} files uploaded successfully.`);

    } catch (err) {

      if (err instanceof Error) {

        toast.error(`Failed to upload files: ${err.message}`);

      } else {
  
        toast.error(`Failed to upload files: ${String(err)}`);
      }
      
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
