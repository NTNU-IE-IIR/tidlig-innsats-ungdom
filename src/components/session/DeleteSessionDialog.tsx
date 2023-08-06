import { api } from '@/utils/api';
import Button from '../input/Button';
import Dialog from '../overlay/Dialog';

interface DeleteSessionDialogProps {
  sessionId: string;
  show: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteSessionDialog: React.FC<DeleteSessionDialogProps> = ({
  sessionId,
  show,
  onClose,
  onDelete,
}) => {
  const utils = api.useContext();
  const { mutate, isLoading } = api.consultation.deleteConsultation.useMutation(
    {
      onSuccess: async () => {
        await utils.consultation.listConsultations.invalidate();
        onDelete();
      },
    }
  );

  return (
    <Dialog open={show} onClose={onClose} className='flex flex-col gap-2 p-4'>
      {({ close }) => (
        <>
          <h2 className='text-lg font-bold'>Slett konsultasjonsøkt</h2>

          <p className='text-sm text-zinc-700'>
            Er du sikker på at du vil slette konsultasjonsøkten?
          </p>

          <p className='text-sm text-zinc-700'>
            Dette kan ikke angres og oversikten over brukt innhold vil bli
            borte.
          </p>

          <div className='flex items-center justify-end gap-2'>
            <Button variant='neutral' onClick={close}>
              Avbryt
            </Button>

            <Button
              variant='destructive'
              onClick={() => mutate(sessionId)}
              isLoading={isLoading}
            >
              Slett
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
};

export default DeleteSessionDialog;
