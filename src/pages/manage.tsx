import Card from '@/components/container/Card';
import TextEditor from '@/components/editor/TextEditor';
import Button from '@/components/input/Button';
import Switch from '@/components/input/Switch';
import TextField from '@/components/input/TextField';
import PageLayout from '@/components/layout/PageLayout';
import Dialog from '@/components/overlay/Dialog';
import ThemeListNode from '@/components/theme/ThemeListNode';
import { CreateMediaInput, createMediaSchema } from '@/schemas/mediaSchemas';
import { MediaType } from '@/server/db/schema';
import { useThemeStore } from '@/store/themeStore';
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
                  <ThemeListNode key={theme.id} theme={theme} />
                ))}
              </ul>

              <Button className='mb-1' onClick={() => setShowThemeDialog(true)}>
                Nytt tema
              </Button>
            </Card>
          </aside>
        </form>

        <Dialog
          open={showThemeDialog}
          onClose={() => setShowThemeDialog(false)}
          className='relative flex flex-col gap-2 p-2'
        >
          {({ close }) => (
            <>
              <h1 className='text-lg font-bold'>Nytt tema</h1>

              <TextField label='Navn' />
              <TextField label='Kort beskrivelse' />

              <h2 className='text-sm font-medium'>Hører under tema:</h2>

              <ul className='flex flex-col gap-2'>
                <li className='flex items-center justify-between text-sm font-semibold'>
                  <span>Angst</span>
                  <Button>Velg</Button>
                </li>
                <li className='flex items-center justify-between text-sm font-semibold'>
                  <span>Depresjon</span>
                  <Button>Velg</Button>
                </li>
                <li className='flex items-center justify-between text-sm font-semibold'>
                  <span>Spiseforstyrrelser</span>
                  <Button>Velg</Button>
                </li>
              </ul>

              <hr />

              <div className='flex items-center gap-1 self-end'>
                <Button variant='primary'>Lagre</Button>
                <Button variant='destructive' onClick={close}>
                  Avbryt
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </PageLayout>
    </>
  );
};

export default ManagePage;
