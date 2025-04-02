import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Image as ImageIcon, FileCode, File } from 'lucide-react';
import { Attachment } from '@/types';
import { TASK_SERVICE_URL } from '@/constants/API_URLS';
import Image from 'next/image';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/themes/prism.css'; // Choose a theme that fits your design
import { useTheme } from 'next-themes';

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
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  useEffect(() => {
    if (isOpen && attachment?.attachment_url && isViewableAsText()) {
      fetchFileContent();
    }
  }, [isOpen, attachment]);

  if (!attachment) return null;

  const fileUrl = attachment.attachment_url 
    ? `${TASK_SERVICE_URL}/${attachment.attachment_url}` 
    : '';
  
  const fileExtension = attachment.original_filename
    ? attachment.original_filename.split('.').pop()?.toLowerCase()
    : '';

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '');
  const isPdf = fileExtension === 'pdf';
  const isCode = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(fileExtension || '');
  const isText = ['txt', 'md', 'csv', 'log'].includes(fileExtension || '');
  const isViewableAsText = () => {
    const ext = attachment?.original_filename
      ?.split('.')
      .pop()
      ?.toLowerCase() || '';
    const isCode = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext);
    const isText = ['txt', 'md', 'csv', 'log'].includes(ext);
    return isCode || isText;
  };

  const fetchFileContent = async () => {
    if (!fileUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      setFileContent(text);
    } catch (err) {
      console.error('Error fetching file content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file content');
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageForPrism = () => {
    switch (fileExtension) {
      case 'js': return languages.javascript;
      case 'jsx': return languages.jsx;
      case 'ts': return languages.typescript;
      case 'tsx': return languages.tsx;
      case 'css': return languages.css;
      case 'html': return languages.html;
      case 'json': return languages.json;
      case 'py': return languages.python;
      case 'java': return languages.java;
      case 'c': case 'cpp': return languages.cpp;
      default: return languages.plain;
    }
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-12 w-12 text-primary" />;
    if (isPdf) return <FileText className="h-12 w-12 text-primary" />;
    if (isCode || isText) return <FileCode className="h-12 w-12 text-primary" />;
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

    if (isViewableAsText()) {
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Loading file content...</p>
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-red-500">Error: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4" 
              onClick={fetchFileContent}
            >
              Retry
            </Button>
          </div>
        );
      }

      return (
        <div className="border rounded-md overflow-hidden">
          <Editor
            value={fileContent}
            onValueChange={() => {}}
            highlight={code => highlight(code, getLanguageForPrism(), '')}
            padding={16}
            readOnly={true}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              minHeight: '60vh',
              maxHeight: '60vh',
              overflow: 'auto',
              backgroundColor: isDarkMode ? '#1e1e2e' : '#f5f5f5',
              color: isDarkMode ? '#f8f8f2' : 'inherit',
            }}
            className="code-editor"
          />
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