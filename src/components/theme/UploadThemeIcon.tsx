import { IconUpload } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import Button from '../input/Button';

interface UploadThemeIconProps {
  existingImage?: string;
  fileToUpload?: File;
  onFileChanged: (file: File | undefined) => void;
}

const UploadThemeIcon: React.FC<UploadThemeIconProps> = ({
  existingImage,
  fileToUpload,
  onFileChanged,
}) => {
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: {
      'image/png': [],
      'image/svg+xml': [],
    },
    onDrop: (files) => {
      onFileChanged(files?.[0]);
    },
  });

  const imageSrc = useMemo(() => {
    if (fileToUpload) {
      return URL.createObjectURL(fileToUpload);
    } else if (existingImage) {
      return existingImage;
    }

    return undefined;
  }, [existingImage, fileToUpload]);

  return (
    <label
      {...getRootProps()}
      className={twMerge(
        'flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-400 text-gray-600 transition-all hover:bg-gray-50',
        isDragActive && 'border-primary-500',
        imageSrc && 'border-transparent'
      )}
    >
      {imageSrc ? (
        <>
          <img src={imageSrc} className='h-24 w-24 rounded-md bg-gray-200 border border-gray-300' />
          <span className='text-sm'></span>
          <Button variant='neutral' className='text-sm' onClick={open}>
            <IconUpload className='w-4 h-4' />
            <span>Last opp nytt ikon</span>
          </Button>
        </>
      ) : (
        <>
          <IconUpload />
          <span className='text-sm font-medium'>Last opp ikon</span>
        </>
      )}

      <input type='file' {...getInputProps()} />
    </label>
  );
};

export default UploadThemeIcon;
