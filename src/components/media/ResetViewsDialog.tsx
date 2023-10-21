import { api } from '@/utils/api';
import Button from '../input/Button';
import { useTenantStore } from '@/store/tenantStore';

interface ResetViewsDialogProps {
  onClose?: () => void;
}

const ResetViewsDialog: React.FC<ResetViewsDialogProps> = ({ onClose }) => {
  const utils = api.useContext();
  const { activeTenantId } = useTenantStore();
  const { isLoading, mutateAsync } = api.media.resetViews.useMutation({
    onSuccess: async () => {
      await utils.media.invalidate();
    },
  });

  const processResetViews = async () => {
    if (activeTenantId) {
      await mutateAsync(activeTenantId);
      onClose?.();
    }
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h2 className='text-lg font-bold'>Nullstill visninger</h2>
      <p className='text-sm text-gray-700'>
        Er du sikker på at du vil nullstille alle visninger?
      </p>

      <p className='text-sm text-gray-700'>
        Dette kan ikke angres, og vil påvirke alt innhold.
      </p>

      <div className='flex justify-end gap-2 text-sm'>
        <Button variant='neutral' onClick={onClose}>
          Avbryt
        </Button>

        <Button
          isLoading={isLoading}
          onClick={processResetViews}
          variant='destructive'
        >
          Nullstill
        </Button>
      </div>
    </div>
  );
};

export default ResetViewsDialog;
