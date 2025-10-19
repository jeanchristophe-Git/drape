'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  label: string;
  accept?: Record<string, string[]>;
  currentFile?: File | null;
}

export function UploadZone({
  onFileSelect,
  label,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  currentFile,
}: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
        // Créer preview
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null as any);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          preview && 'p-0'
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative aspect-square max-h-80 mx-auto">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded-lg"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop the image here' : 'Drop image or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, JPEG or WEBP (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
