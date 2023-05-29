import { api } from '@/utils/api';
import Button from '../input/Button';

interface DeleteMediaDialogProps {
  mediaId?: number;
  onClose: () => void;
}

const DeleteMediaDialog: React.FC<DeleteMediaDialogProps> = ({
  mediaId,
  onClose,
}) => {
  const utils = api.useContext();

  const { mutateAsync: deleteById, isLoading } =
    api.media.deleteById.useMutation({
      onSuccess: async () => {
        await utils.content.listContent.invalidate();
        await utils.media.list.invalidate();
        await utils.media.getById.invalidate();

        onClose?.();
      },
    });

  const processMediaDelete = async () => {
    if (mediaId) {
      await deleteById(mediaId);
    }
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h2 className='text-lg font-bold'>Slett innhold</h2>
      <p className='text-sm text-zinc-700'>
        Er du sikker på at du vil slette innholdet?
      </p>

      <p className='text-sm text-zinc-700'>
        Dette kan ikke angres, og eventuelle tilknytninger vil også slettes.
      </p>

      <div className='flex justify-end gap-2 text-sm'>
        <Button variant='neutral' onClick={onClose}>
          Avbryt
        </Button>

        <Button
          isLoading={isLoading}
          onClick={processMediaDelete}
          variant='destructive'
        >
          Slett
        </Button>
      </div>
    </div>
  );
};

export default DeleteMediaDialog;
