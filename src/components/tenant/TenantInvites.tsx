import { api } from '@/utils/api';
import {
  IconBan,
  IconCheck,
  IconInfinity,
  IconLink,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../input/Button';
import DeleteInviteDialog from '../invite/DeleteInviteDialog';
import Dialog from '../overlay/Dialog';
import dayjs from 'dayjs';
import { useClipboard } from '@mantine/hooks';
import InviteCard from '../invite/InviteCard';

interface TenantInvitesProps {
  expired?: boolean;
}

const TenantInvites: React.FC<TenantInvitesProps> = ({ expired }) => {
  const { data: invites } = api.invitation.listInvites.useQuery({
    expired: expired ?? false,
  });

  const [expiringInviteId, setExpiringInviteId] = useState<string>();
  const clipboard = useClipboard({ timeout: 500 });

  const copyInviteLink = (code: string) => {
    clipboard.copy(window.location.host.concat(`/join?code=${code}`));
  };

  return (
    <div>
      {invites?.length === 0 && (
        <p className='my-8 text-center text-sm text-zinc-600'>
          Fant ingen invitasjoner
        </p>
      )}

      <ul>
        {invites?.map((invite) => (
          <InviteCard
            key={invite.id}
            code={invite.code}
            creator={invite.creator}
            invitedUsers={invite.invitedUsers}
            maxUses={invite.maxUses}
            expiresAt={invite.expiresAt}
            comment={invite.comment}
            onExpire={() => setExpiringInviteId(invite.id)}
          />
        ))}
      </ul>

      <Dialog
        open={expiringInviteId !== undefined}
        onClose={() => setExpiringInviteId(undefined)}
      >
        {({ close }) => (
          <DeleteInviteDialog inviteId={expiringInviteId} onClose={close} />
        )}
      </Dialog>
    </div>
  );
};

export default TenantInvites;
