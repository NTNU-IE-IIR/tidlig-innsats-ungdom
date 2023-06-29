import { IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Link from 'next/link';

export interface SessionMediaEntryProps {
  mediaId: number;
  mediaName: string;
  mediaThemes: {
    theme: {
      id: number;
      name: string;
    } | null;
  }[];
  duration: number;
  isFirst: boolean;
}

const SessionMediaEntry: React.FC<SessionMediaEntryProps> = ({
  mediaId,
  mediaName,
  mediaThemes,
  duration,
  isFirst,
}) => {
  return (
    <Link
      className='relative mb-8 flex items-center gap-2 rounded-md border border-transparent p-1 hover:border-zinc-200 hover:bg-zinc-100'
      href={`/media/${mediaId}`}
    >
      <div className='z-10 h-8 w-8 rounded-full bg-blue-500' />

      <div className='flex-1'>
        <h2 className='inline font-bold'>{mediaName}</h2>

        <time className='ml-1 inline text-sm font-medium'>
          {dayjs.duration(duration, 'seconds').humanize()}
        </time>

        <div className='flex flex-wrap gap-1'>
          {mediaThemes.map(({ theme }) => (
            <div
              key={theme?.id}
              className='rounded-full border border-red-900 bg-red-100 px-1 text-xs font-medium text-red-900'
            >
              {theme?.name}
            </div>
          ))}
        </div>
      </div>

      <IconChevronRight className='h-5 w-5' />

      {!isFirst && (
        <div className='absolute bottom-full left-5 h-full w-0.5 -translate-x-1/2 translate-y-1 bg-zinc-400' />
      )}
    </Link>
  );
};

export default SessionMediaEntry;
