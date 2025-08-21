import { APIURL } from '@/constants/api';

export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    // Convert HTTP to HTTPS for security
    return filePath.replace('http://', 'https://');
  }
  
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  
  // If it starts with uploads/, use it directly
  if (cleanPath.startsWith('uploads/')) {
    return `${APIURL}/${cleanPath}`;
  }
  
  // Otherwise, assume it's a filename and prepend uploads/
  return `${APIURL}/uploads/${cleanPath}`;
};

export const validateFileSize = (file: File, maxSizeMB: number = 50): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};