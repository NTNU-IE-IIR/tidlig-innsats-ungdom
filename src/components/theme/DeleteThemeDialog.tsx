import { api } from '@/utils/api';
import Button from '../input/Button';
import { useState } from 'react';
import Switch from '../input/Switch';

interface DeleteThemeDialogProps {
  themeId?: number;
  onClose?: () => void;
}

const DeleteThemeDialog: React.FC<DeleteThemeDialogProps> = ({
  themeId,
  onClose,
}) => {
  const [deleteChildren, setDeleteChildren] = useState(false);

  const utils = api.useContext();

  const { mutateAsync: deleteById, isLoading } =
    api.theme.deleteThemeById.useMutation({
      onSuccess: async () => {
        await utils.theme.listThemeTree.invalidate();
        await utils.content.listContent.invalidate();
        onClose?.();
      },
    });

  const processThemeDelete = async () => {
    if (themeId) {
      await deleteById({
        id: themeId,
        bubbleChildren: !deleteChildren,
      });
    }
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h2 className='text-lg font-bold'>Slett tema</h2>
      <p className='text-sm text-gray-700'>
        Er du sikker på at du vil slette temaet?
      </p>

      <p className='text-sm text-gray-700'>
        Dette kan ikke angres og eventuelle tilknytninger vil også slettes.
      </p>

      <p className='text-sm text-gray-700'>
        Innhold vil derimot <span className='font-semibold'>ikke</span> slettes.
      </p>

      <div className='flex items-center justify-end gap-2 text-sm'>
        <label className='flex items-center gap-1'>
          <input
            type='checkbox'
            className='rounded-md text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1'
            checked={deleteChildren}
            onChange={(e) => setDeleteChildren(e.target.checked)}
          />

          <span className='select-none'>Slett med undertemaer</span>
        </label>

        <Button variant='neutral' onClick={onClose}>
          Avbryt
        </Button>

        <Button
          isLoading={isLoading}
          onClick={processThemeDelete}
          variant='destructive'
        >
          Slett
        </Button>
      </div>
    </div>
  );
};

export default DeleteThemeDialog;
