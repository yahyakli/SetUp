import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Image as ImageIcon, Film, FileCode, File } from 'lucide-react';
import { Attachment } from '@/types';
import { TASK_SERVICE_URL } from '@/constants/API_URLS';
import Image from 'next/image';

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AttachmentPreviewModal({
  attachment,
  isOpen,
  onClose,
}: AttachmentPreviewModalProps) {
  if (!attachment) return null;

  const fileUrl = attachment.attachment_url 
    ? `${TASK_SERVICE_URL}/${attachment.attachment_url}` 
    : '';
  
  const fileExtension = attachment.original_filename
    ? attachment.original_filename.split('.').pop()?.toLowerCase()
    : '';

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '');
  const isPdf = fileExtension === 'pdf';
  const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(fileExtension || '');
  const isCode = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(fileExtension || '');
  const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension || '');

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-12 w-12 text-primary" />;
    if (isPdf) return <FileText className="h-12 w-12 text-primary" />;
    if (isVideo) return <Film className="h-12 w-12 text-primary" />;
    if (isCode) return <FileCode className="h-12 w-12 text-primary" />;
    return <File className="h-12 w-12 text-primary" />;
  };

  const renderPreview = () => {
    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          {getFileIcon()}
          <p className="mt-4 text-muted-foreground">Preview not available</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex justify-center">
          <Image 
            src={fileUrl} 
            alt={attachment.original_filename || 'Image preview'} 
            width={1000}
            height={1000}
            className="max-h-[60vh] max-w-full object-contain rounded-md"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <iframe 
          src={`${fileUrl}#view=FitH`} 
          className="w-full h-[60vh] border-0 rounded-md"
          title={attachment.original_filename || 'PDF preview'}
        />
      );
    }

    if (isVideo) {
      return (
        <video 
          controls 
          className="max-h-[60vh] max-w-full rounded-md"
        >
          <source src={fileUrl} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <audio controls className="w-full">
            <source src={fileUrl} type={`audio/${fileExtension}`} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    // For other file types that can't be previewed
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
        {getFileIcon()}
        <p className="mt-4 text-muted-foreground">Preview not available for this file type</p>
        <p className="text-sm text-muted-foreground">{fileExtension?.toUpperCase()} file</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            <span className="ml-2">{attachment.original_filename || 'File Preview'}</span>
          </DialogTitle>
          <DialogDescription>
            {attachment.file_size
              ? `${(attachment.file_size / 1024).toFixed(2)} KB`
              : 'Unknown size'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          {renderPreview()}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open(fileUrl, '_blank')}
              disabled={!fileUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 