import { api } from '@/utils/api';
import { IconChevronLeft, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import Button from '../input/Button';
import TextArea from '../input/TextArea';
import TextField from '../input/TextField';
import DeleteSessionDialog from './DeleteSessionDialog';
import SessionMediaEntry from './SessionMediaEntry';

interface EndedSessionMediaEntry {
  mediaId: number;
  duration: number | null;
  media: {
    name: string;
    themes: {
      theme: {
        id: number;
        name: string;
      } | null;
    }[];
  };
}

interface EndedSessionProps {
  id: string;
  name: string;
  notes: string;
  entries: EndedSessionMediaEntry[];
  onClose: () => void;
}

const EndedSession: React.FC<EndedSessionProps> = ({
  id,
  name,
  notes,
  entries,
  onClose,
}) => {
  const utils = api.useContext();
  const { isLoading, mutateAsync } =
    api.consultation.updateConsultation.useMutation({
      onSuccess: async () => {
        await utils.consultation.listConsultations.invalidate();
      },
    });

  const [sessionName, setSessionName] = useState(name);
  const [sessionNotes, setSessionNotes] = useState(notes);

  const hasChanged = sessionName !== name || sessionNotes !== notes;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        consultationId: id,
        consultationName: sessionName,
        notes: sessionNotes,
      });
      onClose();
    } catch (error) {}
  };

  return (
    <>
      <h1 className='text-xl font-semibold'>Øktsammendrag</h1>

      <TextField label='Navn' value={sessionName} onChange={setSessionName} />

      <h2 className='-mb-2 font-semibold'>Tidslinje</h2>

      <hr className='border-gray-300' />

      {entries?.map((entry, i) => (
        <SessionMediaEntry
          key={id + entry.mediaId}
          mediaId={entry.mediaId}
          mediaName={entry.media.name}
          mediaThemes={entry.media.themes}
          duration={entry.duration ?? 0}
          isFirst={i === 0}
        />
      ))}

      <h2 className='-mb-2 mt-auto font-semibold'>Notater</h2>
      <TextArea
        value={sessionNotes}
        onChange={(e) => setSessionNotes(e.target.value)}
      />

      {hasChanged && (
        <Button variant='primary' onClick={handleSubmit} isLoading={isLoading}>
          Lagre endringer
        </Button>
      )}

      <Button variant='neutral' onClick={onClose}>
        <IconChevronLeft />
        <span>Tilbake</span>
      </Button>

      <Button variant='destructive' onClick={() => setShowDeleteDialog(true)}>
        <IconTrash className='h-5 w-5' />
        <span>Slett økt</span>
      </Button>

      <DeleteSessionDialog
        sessionId={id}
        show={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={() => {
          setShowDeleteDialog(false);
          onClose();
        }}
      />
    </>
  );
};

export default EndedSession;
