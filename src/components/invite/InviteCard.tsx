import { useClipboard } from '@mantine/hooks';
import {
  IconBan,
  IconCheck,
  IconInfinity,
  IconLink,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';
import Button from '../input/Button';
import Tooltip from '../feedback/Tooltip';
import { FloatingDelayGroup } from '@floating-ui/react';

interface InviteCardProps {
  code: string;
  creator: string;
  invitedUsers: number;
  maxUses: number | null;
  expiresAt: Date;
  comment: string | null;
  onExpire: () => void;
  onShowMembers: () => void;
}

const InviteCard: React.FC<InviteCardProps> = ({
  code,
  creator,
  invitedUsers,
  maxUses,
  expiresAt,
  comment,
  onExpire,
  onShowMembers,
}) => {
  const clipboard = useClipboard({ timeout: 1000 });

  const copyInviteLink = (code: string) => {
    const url = new URL(window.location.toString());
    url.pathname = '/join';
    url.searchParams.set('code', code);
    clipboard.copy(url.toString());
  };

  return (
    <li className='m-1 flex gap-1 rounded-md border p-1 shadow'>
      <div className='flex-1'>
        <p
          className={twMerge('font-medium', !comment && 'italic text-gray-400')}
        >
          {!comment || comment?.length === 0 ? '(ingen kommentar)' : comment}
        </p>
        <div className='flex items-center gap-1'>
          <IconUser className='h-4 w-4' />
          <p className='text-sm font-medium'>{creator}</p>
        </div>
        <div className='flex items-center gap-1 font-semibold'>
          <span>{invitedUsers}</span>
          <span>/</span>
          {maxUses === null ? <IconInfinity /> : <span>{maxUses}</span>}

          <span className='text-sm font-normal'>invitasjoner brukt</span>
        </div>
      </div>

      <FloatingDelayGroup delay={100}>
        <Tooltip content='Vis anvendelser'>
          <Button
            onClick={onShowMembers}
            variant='neutral'
            className='aspect-square h-fit self-center p-1'
          >
            <IconUsersGroup className='h-5 w-5' />
          </Button>
        </Tooltip>

        {dayjs().isBefore(expiresAt) && (
          <>
            <Tooltip
              open={clipboard.copied ? clipboard.copied : undefined}
              content={
                clipboard.copied
                  ? 'Kobling kopiert til utklippstavle'
                  : 'Kopier kobling'
              }
            >
              <Button
                variant='neutral'
                onClick={() => copyInviteLink(code)}
                className={twMerge(
                  'aspect-square h-fit self-center p-1 transition-colors',
                  clipboard.copied &&
                    'bg-primary-500 text-gray-100 hover:bg-primary-600 focus:bg-primary-600'
                )}
              >
                {clipboard.copied ? (
                  <IconCheck className='h-5 w-5' />
                ) : (
                  <IconLink className='h-5 w-5' />
                )}
              </Button>
            </Tooltip>

            <Tooltip content='Avslutt'>
              <Button
                variant='destructive'
                onClick={onExpire}
                className='aspect-square h-fit self-center p-1'
              >
                <IconBan className='h-5 w-5' />
              </Button>
            </Tooltip>
          </>
        )}
      </FloatingDelayGroup>
    </li>
  );
};

export default InviteCard;
