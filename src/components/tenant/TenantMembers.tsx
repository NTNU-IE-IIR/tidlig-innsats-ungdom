import { api } from '@/utils/api';
import TextField from '../input/TextField';
import Table from '../table/Table';
import { useTenantStore } from '@/store/tenantStore';
import dayjs from 'dayjs';
import Button from '../input/Button';
import { twMerge } from 'tailwind-merge';

const TenantMembers = () => {
  const { activeTenantId } = useTenantStore();
  const { data: members } = api.tenant.listMembers.useQuery(
    {
      tenantId: activeTenantId!,
    },
    {
      enabled: activeTenantId !== null,
    }
  );

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
              <Button variant='destructive' className='text-sm'>
                Opphev
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </div>
  );
};

export default TenantMembers;
