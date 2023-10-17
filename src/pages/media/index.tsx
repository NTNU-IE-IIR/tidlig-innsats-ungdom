import Card from '@/components/container/Card';
import Tooltip from '@/components/feedback/Tooltip';
import Button from '@/components/input/Button';
import Switch from '@/components/input/Switch';
import TextField from '@/components/input/TextField';
import PageLayout from '@/components/layout/PageLayout';
import DeleteMediaDialog from '@/components/media/DeleteMediaDialog';
import Dialog from '@/components/overlay/Dialog';
import Table from '@/components/table/Table';
import DeleteThemeDialog from '@/components/theme/DeleteThemeDialog';
import ThemeForm from '@/components/theme/ThemeForm';
import ThemeListNode from '@/components/theme/ThemeListNode';
import { ThemeNode } from '@/types/themes';
import { api } from '@/utils/api';
import { exportCsv } from '@/utils/exports';
import { useDebouncedValue } from '@mantine/hooks';
import { IconCheck, IconFileExport, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const MediaIndexPage: NextPage = () => {
  const [mediaName, setMediaName] = useState('');
  const [onlyPersonal, setOnlyPersonal] = useState(false);
  const [onlyPublished, setOnlyPublished] = useState(false);

  const [debouncedMediaName] = useDebouncedValue(mediaName, 500);

  const { data: medias } = api.media.list.useQuery({
    name: debouncedMediaName,
    onlyPersonal,
    onlyPublished,
  });

  const { data: themes } = api.theme.listThemeTree.useQuery({});

  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showDeleteThemeDialog, setShowDeleteThemeDialog] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<number>();

  const [deletingMediaId, setDeletingMediaId] = useState<number>();

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

  const handleExport = () => {
    if (medias) {
      exportCsv({
        data: medias,
        headers: {
          id: 'id',
          name: 'navn',
          associations: 'tilknytninger',
          views: 'visninger',
          createdAt: 'opprettet',
          createdByName: 'opprettet av',
          published: 'publisert',
          shortDescription: 'kort beskrivelse',
          type: 'type',
          updatedAt: 'oppdatert',
        },
        skip: [],
        fileName: `innhold-${dayjs().format('DDMMYYYY')}.csv`,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='grid grid-cols-3 gap-2'>
        <div className='col-span-2 flex flex-col'>
          <h1 className='text-lg font-bold'>Innhold</h1>

          <Card className='flex flex-1 flex-col gap-1 py-2'>
            <div className='flex items-center gap-2'>
              <TextField
                label='Navn'
                value={mediaName}
                onChange={setMediaName}
              />

              <div className='flex items-center gap-1'>
                <Switch checked={onlyPersonal} onChange={setOnlyPersonal} />
                <span className='text-sm font-medium'>Vis kun egne</span>
              </div>

              <div className='flex items-center gap-1'>
                <Switch checked={onlyPublished} onChange={setOnlyPublished} />
                <span className='text-sm font-medium'>Vis kun publiserte</span>
              </div>

              <Link href='/media/new' className='ml-auto text-sm'>
                <Button>Nytt innhold</Button>
              </Link>
            </div>

            <hr />

            <Tooltip content='Eksporter til CSV'>
              <Button
                variant='neutral'
                className='ml-auto'
                onClick={handleExport}
              >
                <IconFileExport className='text-zinc-500' />
              </Button>
            </Tooltip>

            <Table columns={7}>
              <Table.Header>
                <ColumnHeader>Navn</ColumnHeader>
                <ColumnHeader center>Tilknytninger</ColumnHeader>
                <ColumnHeader center>Visninger</ColumnHeader>
                <ColumnHeader center>Publisert</ColumnHeader>
                <ColumnHeader>Opprettet av</ColumnHeader>
                <ColumnHeader>Sist endret</ColumnHeader>
                <ColumnHeader>
                  <span className='sr-only'>Handlinger</span>
                </ColumnHeader>
              </Table.Header>

              {medias?.length === 0 && (
                <p className='col-span-6 py-8 text-center text-sm'>
                  Fant ikke noe innhold, prøv å justere søket eller{' '}
                  <Link
                    href='/media/new'
                    className='font-medium hover:underline'
                  >
                    opprett nytt.
                  </Link>
                </p>
              )}

              {medias?.map((media) => (
                <Table.Row
                  key={media.id}
                  className='items-center border-b py-2 text-sm last:border-b-0'
                >
                  <Table.Cell>{media.name}</Table.Cell>
                  <Table.Cell className='text-center text-sm font-semibold text-primary-500 hover:underline'>
                    {media.associations}
                  </Table.Cell>
                  <Table.Cell className='text-center text-sm font-semibold text-primary-500 hover:underline'>
                    {media.views}
                  </Table.Cell>
                  <Table.Cell className='flex items-center justify-center'>
                    {media.published ? (
                      <>
                        <span className='sr-only'>Publisert</span>
                        <IconCheck className='text-ok-500' />
                      </>
                    ) : (
                      <>
                        <span className='sr-only'>Ikke publisert</span>
                        <IconX className='text-error-500' />
                      </>
                    )}
                  </Table.Cell>
                  <Table.Cell className='text-sm font-medium'>
                    {media.createdByName}
                  </Table.Cell>
                  <Table.Cell className='text-sm font-medium'>
                    {dayjs(media.updatedAt).fromNow()}
                  </Table.Cell>
                  <Table.Cell className='flex items-center justify-end gap-1'>
                    <Link href={'/media/' + media.id + '/edit'}>
                      <Button className='text-sm' variant='neutral'>
                        Rediger
                      </Button>
                    </Link>

                    <Button
                      onClick={() => setDeletingMediaId(media.id)}
                      className='text-sm'
                      variant='destructive'
                    >
                      Slett
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table>
          </Card>
        </div>

        <div className='flex flex-col'>
          <h1 className='text-lg font-bold'>Tema</h1>

          <Card className='flex flex-1 flex-col'>
            {themes?.length === 0 && (
              <p className='py-8 text-center text-sm font-medium text-gray-500'>
                Fant ingen temaer.
              </p>
            )}

            <ul className='flex-1'>
              {themes?.map((theme) => (
                <ThemeListNode
                  key={theme.id}
                  theme={theme}
                  selectable={false}
                  onChange={handleEditTheme}
                  onDelete={handleDeleteTheme}
                />
              ))}
            </ul>

            <Button className='mb-1 text-sm' onClick={handleNewTheme}>
              Nytt tema
            </Button>
          </Card>
        </div>
      </PageLayout>

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

      <Dialog
        open={deletingMediaId !== undefined}
        onClose={() => setDeletingMediaId(undefined)}
      >
        {({ close }) => (
          <DeleteMediaDialog mediaId={deletingMediaId} onClose={close} />
        )}
      </Dialog>
    </>
  );
};

const ColumnHeader = ({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) => (
  <h2
    role='columnheader'
    className={twMerge('py-1 text-sm font-semibold', center && 'text-center')}
  >
    {children}
  </h2>
);

export default MediaIndexPage;
