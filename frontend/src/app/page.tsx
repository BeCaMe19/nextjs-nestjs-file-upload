"use client";
import { useState } from "react";

interface UploadedFile {
  filename: string;
  path: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      if (
        !selectedFile.type.match(/image\/(jpg|jpeg|png|gif)|application\/pdf/)
      ) {
        setError("Only images (JPG, PNG, GIF) and PDF files are allowed");
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:3001/upload/file", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText) as UploadedFile;
          setUploadedFile(response);
          setError(null);
        } else {
          setError("File upload failed");
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError("Network error");
        setUploading(false);
      };

      xhr.send(formData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Error uploading file");
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload File</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.pdf"
        />
        <button type="submit" disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {uploading && (
        <div>
          <progress value={uploadProgress} max="100" />
          <span>{Math.round(uploadProgress)}%</span>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {uploadedFile && (
        <div>
          <h2>Uploaded File</h2>
          <p>Filename: {uploadedFile.filename}</p>
          <p>Path: {uploadedFile.path}</p>
          {uploadedFile.filename.match(/\.(jpg|jpeg|png|gif)$/) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`http://localhost:3001/${uploadedFile.filename}`}
              alt="Uploaded"
            />
          ) : (
            <a
              href={`http://localhost:3001/${uploadedFile.filename}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}
