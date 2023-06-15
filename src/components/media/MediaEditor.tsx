import Card from '@/components/container/Card';
import TextEditor from '@/components/editor/TextEditor';
import Button from '@/components/input/Button';
import Switch from '@/components/input/Switch';
import TextField from '@/components/input/TextField';
import Dialog from '@/components/overlay/Dialog';
import DeleteThemeDialog from '@/components/theme/DeleteThemeDialog';
import ThemeForm from '@/components/theme/ThemeForm';
import ThemeListNode from '@/components/theme/ThemeListNode';
import {
  CreateMediaInput,
  UpdateMediaInput,
  createMediaSchema,
  updateMediaSchema,
} from '@/schemas/mediaSchemas';
import { MediaType } from '@/server/db/schema';
import { useTenantStore } from '@/store/tenantStore';
import { useThemeStore } from '@/store/themeStore';
import { ThemeNode } from '@/types/themes';
import { RouterOutputs, api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import {
  IconChevronLeft,
  IconFile,
  IconFileText,
  IconListCheck,
} from '@tabler/icons-react';
import { EditorState } from 'lexical';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Tooltip from '../feedback/Tooltip';
import UploadMediaFile from './UploadMediaFile';

interface MediaEditorProps {
  existingMedia?: RouterOutputs['media']['getById'];
}

const MediaEditor: React.FC<MediaEditorProps> = ({ existingMedia }) => {
  const { data: themes } = api.theme.listThemeTree.useQuery({});
  const [editorState, setEditorState] = useState<EditorState>();
  const { selectedThemeIds, set, isEqual } = useThemeStore();
  const [mediaType, setMediaType] = useState(existingMedia?.type);
  const [fileToUpload, setFileToUpload] = useState<File>();
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showDeleteThemeDialog, setShowDeleteThemeDialog] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<number>();
  const [contentChanged, setContentChanged] = useState(false);
  const { activeTenantId } = useTenantStore();

  const utils = api.useContext();

  const { mutateAsync: createMedia, isLoading: isCreating } =
    api.media.create.useMutation();
  const { mutateAsync: updateMedia, isLoading: isUpdating } =
    api.media.update.useMutation({
      onSuccess: async () => {
        await utils.media.getById.invalidate();
      },
    });

  const initialThemeIds = existingMedia?.themes
    .map((theme) => theme?.id)
    .filter(Boolean) as number[];

  useEffect(() => {
    set(initialThemeIds);
  }, []);

  const form = useForm<CreateMediaInput | UpdateMediaInput>({
    validate: zodResolver(
      existingMedia ? updateMediaSchema : createMediaSchema
    ),
    initialValues: {
      id: existingMedia?.id,
      name: existingMedia?.name ?? '',
      shortDescription: existingMedia?.shortDescription ?? '',
      themeIds: initialThemeIds ?? [],
      type: MediaType.RICH_TEXT,
      published: !existingMedia?.published ?? false,
    },
  });

  const isChanged =
    !isEqual(initialThemeIds) || contentChanged || form.isDirty();

  const router = useRouter();

  const submit = async (values: CreateMediaInput | UpdateMediaInput) => {
    let content;

    if (mediaType === MediaType.FILE && fileToUpload) {
      const formData = new FormData();

      formData.append('file', fileToUpload);

      const response = await fetch(`/api/static/${activeTenantId}/upload`, {
        method: 'POST',
        body: formData,
      });

      const { fileId } = await response.json();

      content = {
        tenantId: activeTenantId,
        fileId,
      };
    } else if (mediaType === MediaType.RICH_TEXT) {
      content = editorState?.toJSON();
    }

    if (existingMedia) {
      await updateMedia({
        ...values,
        id: existingMedia.id,
        themeIds: Array.from(selectedThemeIds),
        content,
        published: !values.published,
      });

      router.push('/media');

      return;
    }

    await createMedia({
      ...values,
      themeIds: Array.from(selectedThemeIds),
      content,
      published: !values.published,
    });

    router.push('/media');
  };

  const handleNewTheme = () => {
    setEditingThemeId(undefined);
    setShowThemeDialog(true);
  };

  const handleEditTheme = (theme: ThemeNode) => {
    setEditingThemeId(theme.id);
    setShowThemeDialog(true);
  };

  const handleDeleteTheme = (theme: ThemeNode) => {
    setEditingThemeId(theme.id);
    setShowDeleteThemeDialog(true);
  };

  return (
    <>
      <form
        className='col-span-3 grid grid-cols-[inherit] gap-4'
        onSubmit={form.onSubmit(submit)}
      >
        <section className='col-span-2 flex flex-col'>
          <h2 className='text-lg font-bold'>Nytt innhold</h2>
          <Card className='flex flex-1 flex-col gap-2 py-2'>
            <TextField label='Navn' {...form.getInputProps('name')} />

            <TextField
              label='Kort beskrivelse'
              {...form.getInputProps('shortDescription')}
            />

            {mediaType === undefined && (
              <div className='flex flex-1 flex-col items-center justify-center'>
                <p className='pb-4 text-lg font-medium text-zinc-700'>
                  Velg type innhold du vil opprette
                </p>

                <div className='grid grid-cols-3 place-items-center gap-4'>
                  <Button
                    variant='neutral'
                    className='w-full'
                    onClick={() => setMediaType(MediaType.RICH_TEXT)}
                  >
                    <div className='flex flex-col items-center'>
                      <IconFileText className='h-10 w-10' />
                      <span className='text-sm font-semibold'>Fritekst</span>
                    </div>
                  </Button>

                  <Button
                    variant='neutral'
                    className='w-full'
                    onClick={() => setMediaType(MediaType.FILE)}
                  >
                    <div className='flex flex-col items-center'>
                      <IconFile className='h-10 w-10' />
                      <span className='text-sm font-semibold'>
                        Last opp fil
                      </span>
                    </div>
                  </Button>

                  <Tooltip content='Ikke tilgjengelig, enda.'>
                    <Button disabled variant='neutral' className='w-full'>
                      <div className='flex flex-col items-center'>
                        <IconListCheck className='h-10 w-10' />
                        <span className='text-sm font-semibold'>Skjema</span>
                      </div>
                    </Button>
                  </Tooltip>
                </div>
              </div>
            )}

            {mediaType !== undefined && (
              <Button
                className='w-fit pl-0.5 text-sm'
                variant='neutral'
                onClick={() => setMediaType(undefined)}
              >
                <IconChevronLeft className='h-4 w-4' />
                <span>Bytt type innhold</span>
              </Button>
            )}

            {mediaType === MediaType.FILE && (
              <UploadMediaFile
                className='flex-1'
                fileToUpload={fileToUpload}
                onFileChanged={setFileToUpload}
              />
            )}

            {mediaType === MediaType.RICH_TEXT && (
              <TextEditor
                name={`media` + (existingMedia?.id ?? '')}
                initialState={existingMedia?.content as any}
                onEditorChange={setEditorState}
                onCanUndo={setContentChanged}
                className='flex-1'
              />
            )}

            <div className='flex items-center gap-1'>
              <Switch
                label='Utkast'
                checked={form.values.published}
                onChange={(value) => form.setFieldValue('published', value)}
              />

              <label className='font-medium'>
                Lagre som utkast{' '}
                <span className='text-sm text-zinc-600'>(kun du kan se)</span>
              </label>
            </div>

            <div className='flex items-center justify-end gap-2'>
              {isChanged && (
                <p className='text-sm font-medium text-zinc-600'>
                  Du har ulagrede endringer.
                </p>
              )}

              <Button
                type='submit'
                className='self-end'
                isLoading={isCreating || isUpdating}
                disabled={!isChanged}
              >
                Lagre
              </Button>
            </div>
          </Card>
        </section>

        <aside className='flex flex-col'>
          <h2 className='text-lg font-bold'>Knytt til en/flere tema</h2>
          <Card className='flex flex-1 flex-col'>
            {themes?.length === 0 && (
              <p className='py-8 text-center text-sm font-medium text-zinc-500'>
                Fant ingen temaer.
              </p>
            )}

            <ul className='flex-1'>
              {themes?.map((theme) => (
                <ThemeListNode
                  key={theme.id}
                  theme={theme}
                  onChange={handleEditTheme}
                  onDelete={handleDeleteTheme}
                />
              ))}
            </ul>

            <Button className='mb-1' onClick={handleNewTheme}>
              Nytt tema
            </Button>
          </Card>
        </aside>
      </form>

      <Dialog
        open={showDeleteThemeDialog}
        onClose={() => setShowDeleteThemeDialog(false)}
      >
        {({ close }) => (
          <DeleteThemeDialog themeId={editingThemeId} onClose={close} />
        )}
      </Dialog>

      <Dialog
        open={showThemeDialog}
        onClose={() => setShowThemeDialog(false)}
        className='relative flex max-w-xl flex-col gap-2 p-0'
      >
        {({ close }) => (
          <ThemeForm
            themeId={editingThemeId}
            onSuccess={close}
            onCancel={close}
          />
        )}
      </Dialog>
    </>
  );
};

export default MediaEditor;
