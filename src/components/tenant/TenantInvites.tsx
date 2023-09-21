import { api } from '@/utils/api';
import { forwardRef, useState } from 'react';
import DeleteInviteDialog from '../invite/DeleteInviteDialog';
import InviteCard from '../invite/InviteCard';
import InvitedUsersDialog from '../invite/InvitedUsersDialog';
import Dialog from '../overlay/Dialog';

interface TenantInvitesProps {
  expired?: boolean;
}

const TenantInvites = forwardRef<HTMLDivElement, TenantInvitesProps>(
  ({ expired }, ref) => {
    const { data: invites } = api.invitation.listInvites.useQuery({
      expired: expired ?? false,
    });

    const [expiringInviteId, setExpiringInviteId] = useState<string>();
    const [showMembersInviteId, setShowMembersInviteId] = useState<string>();

    return (
      <div ref={ref}>
        {invites?.length === 0 && (
          <p className='my-8 text-center text-sm text-gray-600'>
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
              onShowMembers={() => setShowMembersInviteId(invite.id)}
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

        <Dialog
          open={showMembersInviteId !== undefined}
          onClose={() => setShowMembersInviteId(undefined)}
        >
          {({ close }) => (
            <InvitedUsersDialog
              invitationId={showMembersInviteId}
              onClose={close}
            />
          )}
        </Dialog>
      </div>
    );
  }
);

export default TenantInvites;
