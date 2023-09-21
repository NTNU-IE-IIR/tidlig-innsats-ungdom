import { IconFileCheck, IconFileUpload } from '@tabler/icons-react';
import { useCallback, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { useDropzone } from 'react-dropzone';
import Button from '../input/Button';

interface UploadMediaFileProps {
  fileToUpload?: File;
  onFileChanged: (file?: File) => void;
  className?: string;
}

const UploadMediaFile: React.FC<UploadMediaFileProps> = ({
  fileToUpload,
  onFileChanged,
  className,
}) => {
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: (files) => {
      onFileChanged(files?.[0]);
    },
  });

  return (
    <label
      {...getRootProps()}
      className={twMerge(
        'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-400 text-gray-600 transition-all hover:bg-gray-50',
        isDragActive && 'border-primary-500',
        className
      )}
    >
      <input type='file' className='hidden' {...getInputProps()} />

      {fileToUpload === undefined && (
        <>
          <IconFileUpload className='h-12 w-12' />
          <p className='text-center text-sm font-medium'>
            {isDragActive ? (
              'Slipp filen for å laste opp'
            ) : (
              <>
                Dra og slipp filen du vil laste opp, <br /> eller{' '}
                <span className='font-semibold text-primary-600'>
                  trykk for å velge
                </span>
              </>
            )}
          </p>
        </>
      )}

      {fileToUpload !== undefined && (
        <>
          <IconFileCheck className='h-12 w-12' />
          <p className='text-center text-sm font-medium'>
            Laster opp: <br />
            {fileToUpload.name}
          </p>

          <Button className='text-sm' variant='neutral' onClick={open}>
            Velg annen fil
          </Button>
        </>
      )}
    </label>
  );
};

export default UploadMediaFile;
