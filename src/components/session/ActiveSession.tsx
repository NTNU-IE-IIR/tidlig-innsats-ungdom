import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';
import { api } from '@/utils/api';
import Button from '../input/Button';
import TextField from '../input/TextField';
import SessionMediaEntry from './SessionMediaEntry';
import TextArea from '../input/TextArea';

const ActiveSession = () => {
  const { activeSession, clearSession, setSessionName, setSessionNotes } =
    useSessionStore();

  // if there is no active session, we shouldn't render this component
  if (activeSession === null) return null;

  const { data: entries } = api.media.getByIdsWithThemes.useQuery(
    Object.keys(activeSession?.viewedMedias ?? {}).map(Number)
  );

  const utils = api.useContext();

  const { mutateAsync: save } = api.consultation.saveConsultation.useMutation({
    onSuccess: () => {
      utils.consultation.listConsultations.invalidate();
      utils.consultation.getConsultation.invalidate();
    },
  });

  const { activeTenantId } = useTenantStore();

  const onEndConsultation = async () => {
    if (activeSession === null || activeTenantId === null) return;

    await save({
      consultationName: activeSession.name,
      tenantId: activeTenantId,
      startedAt: activeSession.startedAt,
      viewedMedias: activeSession.viewedMedias,
      notes: activeSession.notes,
    });

    clearSession();
  };

  return (
    <>
      <h1 className='text-xl font-semibold'>Øktsammendrag</h1>

      <TextField
        label='Navn'
        value={activeSession.name}
        onChange={setSessionName}
      />

      <h2 className='-mb-2 font-semibold'>Tidslinje</h2>

      <hr className='border-zinc-300' />

      {entries?.map((entry, i) => (
        <SessionMediaEntry
          key={`${entry.id}-${activeSession.viewedMedias[entry.id] ?? 0}`}
          mediaId={entry.id}
          mediaName={entry.name}
          mediaThemes={entry.themes}
          isFirst={i === 0}
          duration={activeSession.viewedMedias[entry.id] ?? 0}
        />
      ))}

      <h2 className='-mb-2 mt-auto font-semibold'>Notater</h2>

      <TextArea
        value={activeSession.notes}
        onChange={(e) => setSessionNotes(e.target.value)}
      />

      <Button variant='destructive' onClick={onEndConsultation}>
        Stopp økt
      </Button>
    </>
  );
};

export default ActiveSession;
