import { api } from '@/utils/api';
import { IconCheck, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Button from '../input/Button';
import Table from '../table/Table';

interface InvitedUsersProps {
  invitationId?: string;
  onClose?: () => void;
}

const InvitedUsersDialog: React.FC<InvitedUsersProps> = ({
  invitationId,
  onClose,
}) => {
  const { data: invitedUsers } = api.invitation.listInvitedUsers.useQuery(
    invitationId!,
    {
      enabled: invitationId !== undefined,
    }
  );

  return (
    <div className='flex flex-col gap-2 p-2'>
      <h1 className='font-bold'>Registrerte brukere med invitasjonen</h1>

      <Table className='grid-cols-4'>
        <Table.Header>
          <Table.ColumnHeader>Navn</Table.ColumnHeader>
          <Table.ColumnHeader>Rolle</Table.ColumnHeader>
          <Table.ColumnHeader center>Aktiv</Table.ColumnHeader>
          <Table.ColumnHeader>Registrert</Table.ColumnHeader>
        </Table.Header>
        {invitedUsers?.map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.fullName}</Table.Cell>
            <Table.Cell>Administrator</Table.Cell>
            <Table.Cell className='flex items-center justify-center'>
              <span className='sr-only'>{user.active}</span>
              {user.active ? (
                <IconCheck className='h-4 w-4 text-emerald-500' />
              ) : (
                <IconX className='h-4 w-4 text-red-500' />
              )}
            </Table.Cell>
            <Table.Cell>
              {dayjs(user.createdAt).format('DD.MM.YYYY')}
            </Table.Cell>
          </Table.Row>
        ))}
        {invitedUsers?.length === 0 && (
          <p className='col-span-4 py-2 text-center text-sm text-zinc-500'>
            Ingen brukere har brukt denne invitasjonen ennå.
          </p>
        )}
      </Table>

      <Button onClick={onClose} variant='neutral' className='self-end text-sm'>
        Ok
      </Button>
    </div>
  );
};

export default InvitedUsersDialog;
