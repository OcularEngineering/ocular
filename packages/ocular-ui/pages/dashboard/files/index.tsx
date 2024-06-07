'use client'

import { useState } from 'react'
import api from '@/services/admin-api';

import SectionContainer from "@/components/section-container"
import { UploadedFilesCard } from "@/components/files/uploaded-files-card"
import { useUploadFile } from "@/lib/hooks/files/use-upload-file"
import { FileUploader } from "@/components/files/file-uploader"

export default function Files() {
  const { uploadFiles, progresses, uploadedFiles, isUploading } = useUploadFile(
    "imageUploader",
    { defaultUploadedFiles: [] }
  )

  return (
    <SectionContainer className="space-y-6 mt-10">
      <FileUploader
        maxFiles={4}
        maxSize={4 * 1024 * 1024}
        progresses={progresses}
        onUpload={uploadFiles}
        disabled={isUploading}
      />
      <UploadedFilesCard uploadedFiles={uploadedFiles} />
    </SectionContainer>
  )
}




// import { useState } from 'react';
// import api from '@/services/admin-api';

// const UploadPage = () => {
//   const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
//   const [uploadStatus, setUploadStatus] = useState<string>('');

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedFiles(event.target.files);
//   };

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (!selectedFiles) {
//       setUploadStatus('No files selected.');
//       return;
//     }

//     try {
//       const filesArray = Array.from(selectedFiles);
//       await api.files.upload(filesArray);
//       setUploadStatus('Files uploaded successfully!');
//     } catch (error) {
//       setUploadStatus('Failed to upload files.');
//       console.error(error);
//     }
//   };

//   return (
//     <div>
//       <h1>Upload Files</h1>
//       <form onSubmit={handleSubmit}>
//         <input type="file" multiple onChange={handleFileChange} />
//         <button type="submit">Upload</button>
//       </form>
//       {uploadStatus && <p>{uploadStatus}</p>}
//     </div>
//   );
// };

// export default UploadPage;

