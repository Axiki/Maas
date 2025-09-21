import React, { useCallback, useRef, useState } from 'react';
import { AlertCircle, FileSpreadsheet, Loader2, UploadCloud, X } from 'lucide-react';

export interface ImportUploadZoneProps {
  accept?: string[];
  file?: File | null;
  helperText?: string;
  error?: string;
  isUploading?: boolean;
  maxFileSizeMb?: number;
  onFileSelect: (file: File) => void;
  onRemoveFile?: () => void;
}

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, index);
  return `${size.toFixed(1)} ${sizes[index]}`;
};

export const ImportUploadZone: React.FC<ImportUploadZoneProps> = ({
  accept = ['.csv', '.xlsx'],
  error,
  file,
  helperText,
  isUploading = false,
  maxFileSizeMb = 10,
  onFileSelect,
  onRemoveFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const candidate = files[0];
      const maxBytes = maxFileSizeMb * 1024 * 1024;

      if (candidate.size > maxBytes) {
        return;
      }

      onFileSelect(candidate);
    },
    [maxFileSizeMb, onFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files);
    },
    [handleFiles]
  );

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const hasError = Boolean(error);

  return (
    <div className="space-y-4">
      <label
        htmlFor="import-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-4 px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 bg-surface-100/50 hover:bg-surface-100 ${
          hasError
            ? 'border-danger/60 text-danger'
            : isDragging
            ? 'border-primary-500 bg-primary-100/50 text-primary-600'
            : 'border-line/80 text-ink'
        }`}
      >
        <input
          id="import-upload"
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          ) : file ? (
            <FileSpreadsheet className="h-6 w-6 text-primary-600" />
          ) : (
            <UploadCloud className="h-6 w-6 text-primary-600" />
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="font-medium text-lg">Drag &amp; drop your file here</p>
          <p className="text-sm text-muted">
            {accept.join(', ')} up to {maxFileSizeMb}MB
          </p>
        </div>

        <button
          type="button"
          onClick={openFileDialog}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium shadow-sm hover:bg-primary-600 transition"
        >
          Browse Files
        </button>
      </label>

      {file && (
        <div className="flex items-start justify-between rounded-lg border border-line bg-surface-100 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-primary-100">
              <FileSpreadsheet className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isUploading && <Loader2 className="h-4 w-4 animate-spin text-primary-500" />}
            {onRemoveFile && (
              <button
                type="button"
                onClick={onRemoveFile}
                className="p-1 rounded-md text-muted hover:text-danger hover:bg-danger/10 transition"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {helperText && !hasError && <p className="text-sm text-muted">{helperText}</p>}

      {hasError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
