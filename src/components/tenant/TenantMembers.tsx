import { useTenantStore } from '@/store/tenantStore';
import { api } from '@/utils/api';
import dayjs from 'dayjs';
import { forwardRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../input/Button';
import TextField from '../input/TextField';
import Dialog from '../overlay/Dialog';
import Table from '../table/Table';
import RevokeTenantMembershipDialog from './RevokeTenantMembershipDialog';
import RestoreTenantMembershipDialog from './RestoreTenantMembershipDialog';

interface TenantMembersProps {
  deleted?: boolean;
}

interface Member {
  id: string;
  fullName: string;
}

const TenantMembers = forwardRef<HTMLDivElement, TenantMembersProps>(
  ({ deleted }, ref) => {
    const { activeTenantId, activeTenantName } = useTenantStore();
    const { data: members } = api.tenant.listMembers.useQuery(
      {
        tenantId: activeTenantId!,
        deleted,
      },
      {
        enabled: activeTenantId !== null,
      }
    );

    const [editingUser, setEditingUser] = useState<Member>();
    const [showRevokeAccessDialog, setShowRevokeAccessDialog] = useState(false);
    const [showRestoreAccessDialog, setShowRestoreAccessDialog] =
      useState(false);

    const promptRevoke = (member: Member) => {
      setEditingUser(member);
      setShowRevokeAccessDialog(true);
    };

    const promptRestore = (member: Member) => {
      setEditingUser(member);
      setShowRestoreAccessDialog(true);
    };

    return (
      <div className='flex flex-1 flex-col gap-2 p-2'>
        <TextField label='Navn' />

        <Table columns={4}>
          <Table.Header>
            <Table.ColumnHeader>Navn</Table.ColumnHeader>
            <Table.ColumnHeader center>Rolle</Table.ColumnHeader>
            <Table.ColumnHeader center>Medlem siden</Table.ColumnHeader>
            <Table.ColumnHeader>
              <span className='sr-only'>Handlinger</span>
            </Table.ColumnHeader>
          </Table.Header>
          {members?.map((member, idx, array) => (
            <Table.Row
              key={member.id}
              className={twMerge(
                'items-center py-2',
                idx <= array.length - 1 && 'border-b'
              )}
            >
              <Table.Cell>{member.fullName}</Table.Cell>
              <Table.Cell className='text-center'>Administrator</Table.Cell>
              <Table.Cell className='text-center'>
                {dayjs(member.createdAt).format('DD.MM.YYYY')}
              </Table.Cell>
              <Table.Cell className='place-self-end'>
                {deleted === undefined ? (
                  <Button
                    variant='destructive'
                    className='text-sm'
                    onClick={() =>
                      promptRevoke({
                        id: member.id,
                        fullName: member.fullName,
                      })
                    }
                  >
                    Opphev
                  </Button>
                ) : (
                  <Button
                    variant='neutral'
                    className='text-sm'
                    onClick={() =>
                      promptRestore({
                        id: member.id,
                        fullName: member.fullName,
                      })
                    }
                  >
                    Gjenopprett
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>

        <Dialog
          open={showRevokeAccessDialog}
          onClose={() => setShowRevokeAccessDialog(false)}
        >
          {({ close }) => (
            <RevokeTenantMembershipDialog
              user={editingUser}
              tenant={{
                id: activeTenantId!,
                name: activeTenantName!,
              }}
              onCancel={close}
              onSuccess={close}
            />
          )}
        </Dialog>

        <Dialog
          open={showRestoreAccessDialog}
          onClose={() => setShowRestoreAccessDialog(false)}
        >
          {({ close }) => (
            <RestoreTenantMembershipDialog
              user={editingUser}
              tenant={{
                id: activeTenantId!,
                name: activeTenantName!,
              }}
              onCancel={close}
              onSuccess={close}
            />
          )}
        </Dialog>
      </div>
    );
  }
);

export default TenantMembers;
