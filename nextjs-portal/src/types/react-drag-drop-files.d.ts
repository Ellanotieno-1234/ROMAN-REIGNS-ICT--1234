declare module 'react-drag-drop-files' {
  import { ComponentType } from 'react';
  
  interface FileUploaderProps {
    handleChange: (file: File) => void;
    name: string;
    types: string[];
    disabled?: boolean;
    classes?: string;
    children?: React.ReactNode;
  }

  export const FileUploader: ComponentType<FileUploaderProps>;
}
