import { api } from '@/utils/api';
import Button from '../input/Button';

interface RestoreTenantMembershipDialogProps {
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

const RestoreTenantMembershipDialog: React.FC<
  RestoreTenantMembershipDialogProps
> = ({ tenant, user, onSuccess, onCancel }) => {
  const utils = api.useContext();
  const { mutateAsync: restoreMembership, isLoading } =
    api.tenant.restoreAccess.useMutation({
      onSuccess: () => {
        utils.tenant.listMembers.invalidate();
        onSuccess?.();
      },
    });

  const restore = async () => {
    if (tenant && user) {
      await restoreMembership({
        tenantId: tenant.id,
        userId: user.id,
      });
    }
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h1 className='text-lg font-bold'>
        Er du sikker på at du vil gjenopprette tilgangen?
      </h1>

      <p className='text-sm'>
        <strong>{user?.fullName}</strong> sin tilgang til{' '}
        <strong>{tenant?.name}</strong> vil gjenopprettes.
      </p>

      <p className='text-sm'>
        De vil få tilbake den samme tilgangen som de tidligere hadde.
      </p>

      <div className='flex items-center justify-end gap-2 text-sm'>
        <Button variant='neutral' onClick={onCancel}>
          Avbryt
        </Button>

        <Button onClick={restore} isLoading={isLoading}>
          Gjenopprett
        </Button>
      </div>
    </div>
  );
};

export default RestoreTenantMembershipDialog;
