import { api } from '@/utils/api';
import Button from '../input/Button';

interface RevokeTenantMembershipDialogProps {
  tenant?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    fullName: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RevokeTenantMembershipDialog: React.FC<
  RevokeTenantMembershipDialogProps
> = ({ tenant, user, onSuccess, onCancel }) => {
  const utils = api.useContext();
  const { mutateAsync: revokeMembership, isLoading } =
    api.tenant.revokeMembership.useMutation({
      onSuccess: () => {
        utils.tenant.listMembers.invalidate();
        onSuccess?.();
      },
    });

  const revoke = async () => {
    if (tenant && user) {
      await revokeMembership({
        tenantId: tenant.id,
        userId: user.id,
      });
    }
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h1 className='text-lg font-bold'>
        Er du sikker på at du vil oppheve tilgangen?
      </h1>

      <p className='text-sm'>
        <strong>{user?.fullName}</strong> sin tilgang vil oppheves fra{' '}
        <strong>{tenant?.name}</strong>.
      </p>

      <p className='text-sm'>
        Tilgangen kan gjenopprettes ved et senere tidspunkt om ønskelig.
      </p>

      <div className='flex items-center justify-end gap-2 text-sm'>
        <Button variant='neutral' onClick={onCancel}>
          Avbryt
        </Button>

        <Button variant='destructive' onClick={revoke} isLoading={isLoading}>
          Opphev
        </Button>
      </div>
    </div>
  );
};

export default RevokeTenantMembershipDialog;
