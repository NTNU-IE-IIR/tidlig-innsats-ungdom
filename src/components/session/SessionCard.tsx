import {
  ArrowLongRightIcon,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

interface SessionCardProps {
  title: string;
  startedAt: Date;
  endedAt: Date;
  onClick?: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  title,
  startedAt,
  endedAt,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className='flex cursor-pointer items-center justify-between rounded-md border border-zinc-300 bg-zinc-100 p-2 shadow transition-colors hover:bg-zinc-200'
    >
      <div>
        <h2 className='text-lg font-bold'>{title}</h2>
        <time className='flex items-center gap-1'>
          <CalendarIcon className='h-4 w-4' />
          <span className='text-sm font-semibold  '>
            {dayjs(startedAt).format('DD.MM.YYYY')}
          </span>
        </time>

        <time className='flex items-center gap-1 font-semibold'>
          <ClockIcon className='h-5 w-5' />
          <span>{dayjs(startedAt).format('HH:mm')}</span>
          <ArrowLongRightIcon className='h-5 w-5' />
          <span>{dayjs(endedAt).format('HH:mm')}</span>
        </time>
      </div>

      <ChevronRightIcon className='h-6 w-6' />
    </div>
  );
};

export default SessionCard;
