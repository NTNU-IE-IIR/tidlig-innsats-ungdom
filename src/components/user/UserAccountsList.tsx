import { RouterOutputs, api } from '@/utils/api';
import dayjs from 'dayjs';
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import Tooltip from '../feedback/Tooltip';
import Button from '../input/Button';
import Dialog from '../overlay/Dialog';
import Table from '../table/Table';
import EditUserForm from './EditUserForm';
import { useSession } from 'next-auth/react';

interface UserAccountListProps {}

type UserAccountType = RouterOutputs['userAccount']['listUsers'][number];

const UserAccountList = forwardRef<HTMLDivElement, UserAccountListProps>(
  (_, ref) => {
    const { data: session } = useSession();
    const { data: users } = api.userAccount.listUsers.useQuery();
    const [t] = useTranslation();
    const [editingUser, setEditingUser] = useState<UserAccountType>();

    return (
      <div ref={ref} className='flex flex-1 flex-col gap-2 p-2'>
        <Table columns={5}>
          <Table.Header>
            <Table.ColumnHeader>Navn</Table.ColumnHeader>
            <Table.ColumnHeader center>Medlemskap</Table.ColumnHeader>
            <Table.ColumnHeader center>Rolle</Table.ColumnHeader>
            <Table.ColumnHeader center>Registrert</Table.ColumnHeader>
            <Table.ColumnHeader>
              <span className='sr-only'>Handlinger</span>
            </Table.ColumnHeader>
          </Table.Header>

          {users?.length === 0 && (
            <p className='col-span-5 py-8 text-center text-sm font-medium text-zinc-700'>
              Fant ingen brukere.
            </p>
          )}
          {users?.map((user, idx, array) => (
            <Table.Row
              key={user.id}
              className={twMerge(
                'items-center py-2 text-sm',
                idx < array.length - 1 && 'border-b'
              )}
            >
              <Table.Cell className='flex items-center gap-1'>
                <div className='h-6 w-6 flex-shrink-0 rounded-full bg-zinc-600' />
                <div className='truncate'>
                  <p className='-mb-1 font-semibold'>{user.fullName}</p>
                  <a
                    href={`mailto:${user.email}`}
                    className='text-xs text-cyan-500 hover:underline'
                  >
                    {user.email}
                  </a>
                </div>
              </Table.Cell>
              <Table.Cell className='text-center'>{user.tenants}</Table.Cell>
              <Table.Cell className='text-center'>
                {t('USER_ROLE.'.concat(user.role))}
              </Table.Cell>
              <Table.Cell className='text-center'>
                <Tooltip
                  content={dayjs(user.createdAt).format('HH:mm DD.MM.YYYY')}
                >
                  <div>{dayjs(user.createdAt).format('DD.MM.YYYY')}</div>
                </Tooltip>
              </Table.Cell>
              <Table.Cell className='flex items-center justify-end'>
                <Button
                  variant='neutral'
                  onClick={() => setEditingUser(user)}
                  disabled={user.id === session?.user.id}
                >
                  Endre
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>

        <Dialog
          open={editingUser !== undefined}
          onClose={() => setEditingUser(undefined)}
          className='p-2'
        >
          {({ close }) => (
            <>
              <h1 className='mb-1 text-lg font-bold'>Endre bruker</h1>
              <EditUserForm
                id={editingUser?.id!}
                email={editingUser?.email!}
                fullName={editingUser?.fullName!}
                onSuccess={close}
                onCancel={close}
              />
            </>
          )}
        </Dialog>
      </div>
    );
  }
);

export default UserAccountList;
