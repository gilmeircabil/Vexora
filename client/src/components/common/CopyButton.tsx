import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button, type ButtonProps } from './Button.js';
import { useToast } from '../../context/ToastContext.js';

interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  value: string;
  label?: string;
  successMessage?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  label = 'Copy',
  successMessage = 'Copied to clipboard!',
  variant = 'secondary',
  size = 'sm',
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={!value || props.disabled}
      aria-label={label}
      {...props}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
};
