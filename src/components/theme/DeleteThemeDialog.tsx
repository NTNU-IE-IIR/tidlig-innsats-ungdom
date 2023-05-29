import { api } from '@/utils/api';
import Button from '../input/Button';

interface DeleteThemeDialogProps {
  themeId?: number;
  onClose?: () => void;
}

const DeleteThemeDialog: React.FC<DeleteThemeDialogProps> = ({
  themeId,
  onClose,
}) => {
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
      });
    }
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h2 className='text-lg font-bold'>Slett tema</h2>
      <p className='text-sm text-zinc-700'>
        Er du sikker på at du vil slette temaet?
      </p>

      <p className='text-sm text-zinc-700'>
        Dette kan ikke angres, og eventuelle undertema vil også slettes sammen
        med innholdsreferanser.
      </p>

      <p className='text-sm text-zinc-700'>
        Innhold vil derimot <span className='font-semibold'>ikke</span> slettes.
      </p>

      <div className='flex justify-end gap-2 text-sm'>
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
