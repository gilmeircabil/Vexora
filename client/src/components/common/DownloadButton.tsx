import React from 'react';
import { Download } from 'lucide-react';
import { Button, type ButtonProps } from './Button.js';
import { triggerFileDownload } from '../../lib/files/blob.js';
import { useToast } from '../../context/ToastContext.js';

interface DownloadButtonProps extends Omit<ButtonProps, 'onClick'> {
  file: Blob | string | null | undefined;
  filename: string;
  label?: string;
  successMessage?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  file,
  filename,
  label = 'Download',
  successMessage = 'Download started!',
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const toast = useToast();

  const handleDownload = () => {
    if (!file) return;
    try {
      triggerFileDownload(file, filename);
      toast.success(successMessage);
    } catch {
      toast.error('Could not initiate file download.');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={!file || props.disabled}
      aria-label={`${label} ${filename}`}
      {...props}
    >
      <Download className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );
};
