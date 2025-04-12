import React from 'react';
import Image from 'next/image';
import { MessageAttachment as MessageAttachmentType } from '@/types/index';
import { File, FileText, Download } from 'lucide-react';
import { formatFileSize } from '@/utils/formatters';
import { CHAT_SERVICE_URL } from '@/constants/API_URLS';

interface MessageAttachmentProps {
  attachment: MessageAttachmentType;
}

const MessageAttachment: React.FC<MessageAttachmentProps> = ({ attachment }) => {
  const isImage = attachment.mimeType.startsWith('image/');
  const isPdf = attachment.mimeType === 'application/pdf';
  const isText = attachment.mimeType.startsWith('text/');
  
  const getFileIcon = () => {
    if (isPdf || isText) return <FileText className="text-2xl" />;
    return <File className="text-2xl" />;
  };

  if (isImage) {
    return (
      <div className="mt-2 max-w-xs">
        <div className="relative rounded-lg overflow-hidden">
          <Image 
            src={CHAT_SERVICE_URL + attachment.path} 
            alt={attachment.originalName}
            width={300}
            height={200}
            className="object-contain"
            style={{ maxHeight: '200px', width: 'auto' }}
          />
        </div>
        <div className="text-xs text-gray-800 dark:text-gray-200 mt-1 flex items-center">
          <span>{attachment.originalName}</span>
          <span className="ml-2">({formatFileSize(attachment.size)})</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 max-w-xs">
      <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="mr-3 text-blue-500">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{attachment.originalName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
        </div>
        <a 
          href={CHAT_SERVICE_URL + attachment.path} 
          download={attachment.originalName}
          className="ml-2 p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download />
        </a>
      </div>
    </div>
  );
};

export default MessageAttachment; 