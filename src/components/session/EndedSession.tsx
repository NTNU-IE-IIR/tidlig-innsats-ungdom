import { IconChevronLeft } from '@tabler/icons-react';
import { useState } from 'react';
import Button from '../input/Button';
import TextArea from '../input/TextArea';
import TextField from '../input/TextField';
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
  const [sessionName, setSessionName] = useState(name);

  const hasChanged = sessionName !== name;

  return (
    <>
      <h1 className='text-xl font-semibold'>Øktsammendrag</h1>

      <TextField label='Navn' value={sessionName} onChange={setSessionName} />

      <h2 className='-mb-2 font-semibold'>Tidslinje</h2>

      <hr className='border-zinc-300' />

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
      <TextArea value={notes} readOnly />

      {hasChanged && <Button variant='primary'>Lagre endringer</Button>}

      <Button variant='neutral' onClick={onClose}>
        <IconChevronLeft />
        <span>Tilbake</span>
      </Button>
    </>
  );
};

export default EndedSession;
