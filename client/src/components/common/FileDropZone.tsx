import React, { useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { formatBytes } from '../../lib/format.js';
import {
  validateUploadedFile,
  type ValidatedFile,
  type FileValidationOptions,
} from '../../lib/files/validator.js';
import { type DetectedKind } from '../../lib/files/signatures.js';

interface FileDropZoneProps {
  accept?: string;
  allowedKinds?: readonly DetectedKind[];
  multiple?: boolean;
  maxBytes?: number;
  onFilesSelected: (files: ValidatedFile[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  accept,
  allowedKinds,
  multiple = false,
  maxBytes,
  onFilesSelected,
  onError,
  disabled = false,
  description = 'Drag & drop your files here, or click to browse',
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setValidationError(null);

    const filesToProcess = multiple ? Array.from(fileList) : [fileList[0]!];
    const validatedList: ValidatedFile[] = [];

    const options: FileValidationOptions = {
      allowedKinds,
      maxBytes,
    };

    for (const file of filesToProcess) {
      const res = await validateUploadedFile(file, options);
      if (!res.ok) {
        setValidationError(res.error);
        if (onError) onError(res.error);
        return;
      }
      validatedList.push(res.value);
    }

    if (validatedList.length > 0) {
      onFilesSelected(validatedList);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    await processFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
    // Reset so selecting the same file again triggers change
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="File upload dropzone"
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer select-none outline-none',
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
            : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 hover:border-neutral-400',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="hidden"
          tabIndex={-1}
        />

        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {description}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {multiple ? 'Select one or more files' : 'Single file upload'}
            {maxBytes ? ` · up to ${Math.round(maxBytes / (1024 * 1024))} MB` : ''}
          </p>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 text-xs rounded-lg bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{validationError}</span>
          <button
            onClick={() => setValidationError(null)}
            className="text-rose-600 hover:text-rose-900 dark:hover:text-rose-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const FileInfoCard: React.FC<{
  file: File | ValidatedFile;
  onRemove?: () => void;
}> = ({ file, onRemove }) => {
  const rawFile = 'file' in file ? file.file : file;
  const dimensions = 'dimensions' in file ? file.dimensions : undefined;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
          <FileIcon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {rawFile.name}
          </p>
          <p className="text-xs text-neutral-500">
            {formatBytes(rawFile.size)}
            {dimensions && ` · ${dimensions.width} × ${dimensions.height} px`}
          </p>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${rawFile.name}`}
          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
