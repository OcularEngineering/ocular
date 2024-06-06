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
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        console.log('File here:', file)
        console.log('Appending file:', file.name);
        formData.append('files', file);
      });

      console.log('Form Data:', formData);

      // Log FormData content
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await api.files.upload(formData);

      // Assuming the response contains the uploaded file details
      setUploadedFiles((prev) => (prev ? [...prev, ...response.data] : response.data));
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
