import { IconFileCheck, IconFileUpload } from '@tabler/icons-react';
import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';
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
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <label
      className={twMerge(
        'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-400 text-zinc-600 transition-all hover:bg-zinc-50',
        className
      )}
    >
      <input
        type='file'
        className='hidden'
        ref={fileInput}
        onChange={(e) => onFileChanged(e.target.files?.[0])}
      />

      {fileToUpload === undefined && (
        <>
          <IconFileUpload className='h-12 w-12' />
          <p className='text-center text-sm font-medium'>
            Dra og slipp filen du vil laste opp, <br /> eller{' '}
            <span className='font-semibold text-emerald-600'>
              trykk for å velge
            </span>
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

          <Button
            className='text-sm'
            variant='neutral'
            onClick={() => fileInput.current?.click()}
          >
            Velg annen fil
          </Button>
        </>
      )}
    </label>
  );
};

export default UploadMediaFile;
