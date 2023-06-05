import { api } from '@/utils/api';
import { useState } from 'react';
import DeleteInviteDialog from '../invite/DeleteInviteDialog';
import InviteCard from '../invite/InviteCard';
import Dialog from '../overlay/Dialog';

interface TenantInvitesProps {
  expired?: boolean;
}

const TenantInvites: React.FC<TenantInvitesProps> = ({ expired }) => {
  const { data: invites } = api.invitation.listInvites.useQuery({
    expired: expired ?? false,
  });

  const [expiringInviteId, setExpiringInviteId] = useState<string>();

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
