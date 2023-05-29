import Card from '@/components/container/Card';
import Button from '@/components/input/Button';
import Switch from '@/components/input/Switch';
import TextField from '@/components/input/TextField';
import PageLayout from '@/components/layout/PageLayout';
import Dialog from '@/components/overlay/Dialog';
import DeleteThemeDialog from '@/components/theme/DeleteThemeDialog';
import ThemeForm from '@/components/theme/ThemeForm';
import ThemeListNode from '@/components/theme/ThemeListNode';
import { ThemeNode } from '@/types/themes';
import { api } from '@/utils/api';
import { IconCheck, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const MediaIndexPage: NextPage = () => {
  const [onlyPersonal, setOnlyPersonal] = useState(false);
  const [onlyPublished, setOnlyPublished] = useState(false);

  const { data: medias } = api.media.list.useQuery({
    onlyPersonal,
    onlyPublished,
  });

  const { data: themes } = api.theme.listThemeTree.useQuery({});

  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showDeleteThemeDialog, setShowDeleteThemeDialog] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<number>();

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
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='grid grid-cols-3 gap-2 px-1'>
        <div className='col-span-2 flex flex-col'>
          <h1 className='text-lg font-bold'>Innhold</h1>

          <Card className='flex flex-1 flex-col gap-1 py-2'>
            <div className='flex items-center gap-2'>
              <TextField label='Navn' />

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

            <div role='table' className='grid grid-cols-6 rounded-md border'>
              <div
                role='row'
                className='col-span-6 grid grid-cols-[inherit] rounded-t-md border-b border-zinc-200 bg-zinc-50 px-1 shadow'
              >
                <ColumnHeader>Navn</ColumnHeader>
                <ColumnHeader center>Tilknytninger</ColumnHeader>
                <ColumnHeader center>Publisert</ColumnHeader>
                <ColumnHeader>Opprettet av</ColumnHeader>
                <ColumnHeader>Sist endret</ColumnHeader>
                <ColumnHeader>
                  <span className='sr-only'>Handlinger</span>
                </ColumnHeader>
              </div>

              {medias?.map((media, idx, array) => (
                <div
                  key={media.id}
                  role='row'
                  className={clsx(
                    'col-span-6 grid grid-cols-[inherit] items-center px-1 py-1',
                    idx !== array.length - 1 && 'border-b'
                  )}
                >
                  <div className='text-sm font-medium'>{media.name}</div>
                  <div className='text-center text-sm font-semibold text-sky-500 hover:underline'>
                    {media.associations}
                  </div>
                  <div className='flex items-center justify-center'>
                    {media.published ? (
                      <>
                        <span className='sr-only'>Publisert</span>
                        <IconCheck className='text-emerald-500' />
                      </>
                    ) : (
                      <>
                        <span className='sr-only'>Ikke publisert</span>
                        <IconX className='text-red-500' />
                      </>
                    )}
                  </div>
                  <div className='text-sm font-medium'>
                    {media.createdByName}
                  </div>
                  <div className='text-sm font-medium'>
                    {dayjs(media.updatedAt).fromNow()}
                  </div>
                  <div className='flex items-center justify-end gap-1'>
                    <Link href={'/media/' + media.id + '/edit'}>
                      <Button className='text-sm' variant='neutral'>
                        Rediger
                      </Button>
                    </Link>

                    <Button className='text-sm' variant='destructive'>
                      Slett
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className='flex flex-col'>
          <h1 className='text-lg font-bold'>Tema</h1>

          <Card className='flex flex-1 flex-col'>
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
    className={clsx('py-1 text-sm font-semibold', center && 'text-center')}
  >
    {children}
  </h2>
);

export default MediaIndexPage;
