import { api } from '@/utils/api';
import Button from '../input/Button';

interface DeleteInviteDialogProps {
  inviteId?: string;
  onClose: () => void;
}

const DeleteInviteDialog: React.FC<DeleteInviteDialogProps> = ({
  inviteId,
  onClose,
}) => {
  const utils = api.useContext();

  const { mutateAsync: expireInvite, isLoading } =
    api.invitation.expireInvite.useMutation({
      onSuccess: () => {
        utils.invitation.getInvite.invalidate();
        utils.invitation.listInvites.invalidate();
      },
    });

  const expire = () => {
    if (inviteId) {
      expireInvite(inviteId);
      onClose();
    }
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h2 className='text-lg font-bold'>Avslutt invitasjon</h2>
      <p className='text-sm text-zinc-700'>
        Er du sikker på at du vil avslutte invitasjonen?
      </p>

      <p className='text-sm text-zinc-700'>
        Dette kan ikke angres og invitasjonen kan ikke lenger brukes til å registere kontoer.
      </p>

      <div className='flex items-center justify-end gap-2 text-sm'>
        <Button variant='neutral' onClick={onClose}>
          Avbryt
        </Button>

        <Button
          isLoading={isLoading}
          onClick={expire}
          variant='destructive'
        >
          Avslutt
        </Button>
      </div>
    </div>
  );
};

export default DeleteInviteDialog;
