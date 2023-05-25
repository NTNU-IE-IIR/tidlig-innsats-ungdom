import Card from '@/components/container/Card';
import TextEditor from '@/components/editor/TextEditor';
import Button from '@/components/input/Button';
import Switch from '@/components/input/Switch';
import TextField from '@/components/input/TextField';
import PageLayout from '@/components/layout/PageLayout';
import Dialog from '@/components/overlay/Dialog';
import ThemeForm from '@/components/theme/ThemeForm';
import ThemeListNode from '@/components/theme/ThemeListNode';
import { CreateMediaInput, createMediaSchema } from '@/schemas/mediaSchemas';
import { MediaType } from '@/server/db/schema';
import { useThemeStore } from '@/store/themeStore';
import { ThemeNode } from '@/types/themes';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import { EditorState } from 'lexical';
import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';

const ManagePage: NextPage = () => {
  const { data: themes } = api.theme.listThemeTree.useQuery({});
  const [editorState, setEditorState] = useState<EditorState>();
  const { selectedThemeIds } = useThemeStore();
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showDeleteThemeDialog, setShowDeleteThemeDialog] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<number>();

  const utils = api.useContext();

  const { mutate: deleteTheme } = api.theme.deleteThemeById.useMutation({
    onSuccess: async () => {
      await utils.theme.listThemeTree.invalidate();
      await utils.content.listContent.invalidate();
      setShowDeleteThemeDialog(false);
    },
  });

  const { mutateAsync: createMedia, isLoading } =
    api.media.create.useMutation();

  const form = useForm<CreateMediaInput>({
    validate: zodResolver(createMediaSchema),
    initialValues: {
      name: '',
      themeIds: [],
      type: MediaType.RICH_TEXT,
      published: false,
    },
  });

  const submit = async (values: CreateMediaInput) => {
    await createMedia({
      ...values,
      themeIds: Array.from(selectedThemeIds),
      content: editorState?.toJSON(),
      published: !values.published,
    });
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

  const processThemeDelete = () => {
    if (!editingThemeId) return;

    deleteTheme({
      id: editingThemeId,
    });
  };

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='grid grid-cols-3 px-1'>
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

              <TextEditor
                name='media'
                onEditorChange={setEditorState}
                className='flex-1'
              />

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

              <Button type='submit' className='self-end' isLoading={isLoading}>
                Lagre
              </Button>
            </Card>
          </section>

          <aside className='flex flex-col'>
            <h2 className='text-lg font-bold'>Knytt til en/flere tema</h2>
            <Card className='flex flex-1 flex-col'>
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
            <div className='flex flex-col gap-2 p-4'>
              <h2 className='text-lg font-bold'>Slett tema</h2>
              <p className='text-sm text-zinc-700'>
                Er du sikker på at du vil slette temaet?
              </p>

              <p className='text-sm text-zinc-700'>
                Dette kan ikke angres, og eventuelle undertema vil også slettes
                sammen med innholdsreferanser.
              </p>

              <p className='text-sm text-zinc-700'>
                Innhold vil derimot <span className='font-semibold'>ikke</span>{' '}
                slettes.
              </p>

              <div className='flex justify-end gap-2 text-sm'>
                <Button variant='neutral' onClick={close}>
                  Avbryt
                </Button>

                <Button onClick={processThemeDelete} variant='destructive'>
                  Slett
                </Button>
              </div>
            </div>
          )}
        </Dialog>

        <Dialog
          open={showThemeDialog}
          onClose={() => setShowThemeDialog(false)}
          className='relative flex max-w-xl flex-col gap-2 p-0'
        >
          {({ close }) => (
            <>
              <ThemeForm
                themeId={editingThemeId}
                onSuccess={close}
                onCancel={close}
              />
            </>
          )}
        </Dialog>
      </PageLayout>
    </>
  );
};

export default ManagePage;
