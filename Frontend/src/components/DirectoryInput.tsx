import React, { forwardRef } from "react";

interface DirectoryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onDirectorySelect?: (files: FileList) => void;
}

export const DirectoryInput = forwardRef<HTMLInputElement, DirectoryInputProps>(
  ({ onDirectorySelect, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onDirectorySelect?.(e.target.files);
      }
    };

    return (
      <input
        type="file"
        ref={ref}
        onChange={handleChange}
        {...props}
        webkitdirectory=""
        directory=""
      />
    );
  }
);

DirectoryInput.displayName = "DirectoryInput";
