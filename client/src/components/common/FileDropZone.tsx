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
          'relative border-2 border-black rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer select-none bg-white shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000000]',
          isDragging
            ? 'border-solid bg-[#FACC15]/20 scale-[0.99]'
            : 'border-dashed hover:bg-[#FAF7F2]',
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

        <div className="w-14 h-14 rounded-2xl bg-[#FACC15] border-2 border-black text-black shadow-[2px_2px_0px_#000000] flex items-center justify-center">
          <UploadCloud className="w-7 h-7 stroke-[2.3]" />
        </div>

        <div>
          <p className="text-sm font-black text-black">
            {description}
          </p>
          <p className="text-xs font-semibold text-neutral-600 mt-1">
            {multiple ? 'Select one or more files' : 'Single file upload'}
            {maxBytes ? ` · up to ${Math.round(maxBytes / (1024 * 1024))} MB` : ''}
          </p>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 text-xs rounded-xl bg-[#F472B6]/20 text-black border-2 border-black shadow-[2px_2px_0px_#000000] font-bold"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
          <span className="flex-1">{validationError}</span>
          <button
            onClick={() => setValidationError(null)}
            className="text-black hover:scale-110"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
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
    <div className="flex items-center justify-between p-3.5 rounded-xl border-2 border-black bg-white text-sm shadow-[3px_3px_0px_#000000]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg border-2 border-black bg-[#FACC15] text-black flex items-center justify-center shrink-0">
          <FileIcon className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <p className="font-black text-black truncate text-sm">
            {rawFile.name}
          </p>
          <p className="text-xs font-bold text-neutral-600">
            {formatBytes(rawFile.size)}
            {dimensions && ` · ${dimensions.width} × ${dimensions.height} px`}
          </p>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${rawFile.name}`}
          className="p-1 rounded-lg border border-black bg-neutral-100 hover:bg-[#F472B6] transition-colors"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};
