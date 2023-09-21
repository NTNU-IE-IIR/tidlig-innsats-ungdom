import {
  IconArrowRight,
  IconCalendar,
  IconChevronRight,
  IconClock,
} from '@tabler/icons-react';
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
      className='flex cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-gray-100 p-2 shadow transition-colors hover:bg-gray-200'
    >
      <div>
        <h2 className='text-lg font-bold'>{title}</h2>
        <time className='flex items-center gap-1'>
          <IconCalendar className='h-4 w-4' />
          <span className='text-sm font-semibold  '>
            {dayjs(startedAt).format('DD.MM.YYYY')}
          </span>
        </time>

        <time className='flex items-center gap-1 font-semibold'>
          <IconClock className='h-5 w-5' />
          <span>{dayjs(startedAt).format('HH:mm')}</span>
          <IconArrowRight className='h-5 w-5' />
          <span>{dayjs(endedAt).format('HH:mm')}</span>
        </time>
      </div>

      <IconChevronRight className='h-6 w-6' />
    </div>
  );
};

export default SessionCard;
