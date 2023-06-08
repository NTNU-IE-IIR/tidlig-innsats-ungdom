import { useTenantStore } from '@/store/tenantStore';
import { api } from '@/utils/api';
import { useDebouncedValue } from '@mantine/hooks';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { forwardRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../input/Button';
import TextField from '../input/TextField';
import Dialog from '../overlay/Dialog';
import Table from '../table/Table';
import RegisterMemberForm from './RegisterMemberForm';
import RestoreTenantMembershipDialog from './RestoreTenantMembershipDialog';
import RevokeTenantMembershipDialog from './RevokeTenantMembershipDialog';
import { useTranslation } from 'react-i18next';
import Select from '../input/Select';
import { TenantRole } from '@/server/db/schema';
import { IconCheck, IconSelector } from '@tabler/icons-react';

interface TenantMembersProps {
  deleted?: boolean;
}

interface Member {
  id: string;
  fullName: string;
}

const TenantMembers = forwardRef<HTMLDivElement, TenantMembersProps>(
  ({ deleted }, ref) => {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const { activeTenantId, activeTenantName } = useTenantStore();

    const [name, setName] = useState('');
    const [debouncedName] = useDebouncedValue(name, 500);

    const { data: members } = api.tenant.listMembers.useQuery(
      {
        tenantId: activeTenantId!,
        deleted,
        name: debouncedName,
      },
      {
        enabled: activeTenantId !== null,
      }
    );

    const [editingUser, setEditingUser] = useState<Member>();
    const [showRevokeAccessDialog, setShowRevokeAccessDialog] = useState(false);
    const [showRestoreAccessDialog, setShowRestoreAccessDialog] =
      useState(false);
    const [showRegisterMemberForm, setShowRegisterMemberForm] = useState(false);

    const promptRevoke = (member: Member) => {
      setEditingUser(member);
      setShowRevokeAccessDialog(true);
    };

    const promptRestore = (member: Member) => {
      setEditingUser(member);
      setShowRestoreAccessDialog(true);
    };

    const utils = api.useContext();
    const { mutateAsync: updateRole } = api.tenant.updateRole.useMutation({
      onSuccess: () => {
        utils.tenant.listMembers.invalidate();
      },
    });

    const handleRoleChange = async (member: Member, role: TenantRole) => {
      try {
        await updateRole({
          tenantId: activeTenantId!,
          userId: member.id,
          role,
        });
      } catch (error) {
        // TODO: Handle error
      }
    };

    return (
      <div ref={ref} className='flex flex-1 flex-col gap-2 p-2'>
        <div className='flex items-center gap-2'>
          <TextField label='Navn' onChange={setName} className='flex-1' />

          <Button
            onClick={() => setShowRegisterMemberForm(true)}
            className='h-9 py-0.5 text-sm'
          >
            Nytt medlem
          </Button>
        </div>

        <Table columns={4}>
          <Table.Header>
            <Table.ColumnHeader>Navn</Table.ColumnHeader>
            <Table.ColumnHeader center>Rolle</Table.ColumnHeader>
            <Table.ColumnHeader center>Medlem siden</Table.ColumnHeader>
            <Table.ColumnHeader>
              <span className='sr-only'>Handlinger</span>
            </Table.ColumnHeader>
          </Table.Header>
          {members?.length === 0 && (
            <p className='col-span-4 py-8 text-center text-sm font-medium text-zinc-700'>
              Fant ingen medlemmer.
            </p>
          )}
          {members?.map((member, idx, array) => (
            <Table.Row
              key={member.id}
              className={twMerge(
                'items-center py-2 text-sm',
                idx < array.length - 1 && 'border-b'
              )}
            >
              <Table.Cell>{member.fullName}</Table.Cell>
              <Table.Cell className='flex items-center justify-center'>
                <div className='w-fit'>
                  <Select
                    options={[
                      TenantRole.OWNER,
                      TenantRole.SUPER_USER,
                      TenantRole.USER,
                    ]}
                    disabled={member.id === session?.user.id}
                    value={member.role}
                    onChange={(role) => handleRoleChange(member, role)}
                    selectedRenderer={(role) => (
                      <div className='flex items-center py-0.5 pl-1.5'>
                        <span>{t('TENANT_ROLE.' + role)}</span>
                        <IconSelector className='h-5 w-5' />
                      </div>
                    )}
                    renderer={(role) => (
                      <div className='flex items-center px-1.5 py-0.5'>
                        <span className='flex-1'>
                          {t('TENANT_ROLE.' + role)}
                        </span>
                        <IconCheck
                          className={twMerge(
                            'h-5 w-5',
                            role !== member.role && 'invisible'
                          )}
                        />
                      </div>
                    )}
                  />
                </div>
              </Table.Cell>
              <Table.Cell className='text-center'>
                {dayjs(member.createdAt).format('DD.MM.YYYY')}
              </Table.Cell>
              <Table.Cell className='place-self-end'>
                {deleted === undefined ? (
                  <Button
                    variant='destructive'
                    className='text-sm'
                    disabled={member.id === session?.user.id}
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

        <Dialog
          open={showRegisterMemberForm}
          onClose={() => setShowRegisterMemberForm(false)}
        >
          {({ close }) => (
            <RegisterMemberForm
              tenant={{
                id: activeTenantId!,
                name: activeTenantName!,
              }}
              onSuccess={close}
              onCancel={close}
            />
          )}
        </Dialog>
      </div>
    );
  }
);

export default TenantMembers;
