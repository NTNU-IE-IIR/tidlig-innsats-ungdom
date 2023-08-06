import Card from '@/components/container/Card';
import TextEditor from '@/components/editor/TextEditor';
import TextViewer from '@/components/editor/TextViewer';
import Button from '@/components/input/Button';
import PageLayout from '@/components/layout/PageLayout';
import { UserAccountRole } from '@/server/db/schema';
import { api } from '@/utils/api';
import { IconEdit } from '@tabler/icons-react';
import { EditorState } from 'lexical';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect, useState } from 'react';

const AboutPage = () => {
  const { data: helpContent, dataUpdatedAt } =
    api.help.getHelpContent.useQuery();
  const { data: session } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>();
  const [canUndo, setCanUndo] = useState(false);

  const utils = api.useContext();
  const { mutateAsync, isLoading } = api.help.setHelpContent.useMutation({
    onSuccess: () => {
      utils.help.getHelpContent.invalidate();
      setIsEditing(false);
    },
  });

  useEffect(() => {
    setCanUndo(false);
  }, [isEditing]);

  const updateContent = () => {
    mutateAsync({
      content: editorState?.toJSON(),
    });
  };

  return (
    <>
      <Head>
        <title>Hjelp - Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='flex flex-col'>
        {!isEditing && (
          <>
            {session?.user.role === UserAccountRole.GLOBAL_ADMIN && (
              <Button
                onClick={() => setIsEditing(true)}
                variant='neutral'
                className='ml-auto bg-white text-sm'
              >
                <IconEdit className='h-5 w-5' />
                <span>Rediger</span>
              </Button>
            )}
            {helpContent !== undefined && (
              <TextViewer
                key={dataUpdatedAt}
                name='help-view'
                content={helpContent.content as any}
              />
            )}
          </>
        )}

        {isEditing && (
          <>
            <h1 className='text-xl font-bold'>Rediger hjelp</h1>
            <Card className='flex flex-1 flex-col p-1'>
              <TextEditor
                name='help-edit'
                className='flex-1'
                initialState={(helpContent?.content as any) ?? null}
                onEditorChange={setEditorState}
                onCanUndo={setCanUndo}
              />

              <div className='mt-1 flex items-center justify-end gap-1 text-sm'>
                <Button variant='neutral' onClick={() => setIsEditing(false)}>
                  Avbryt
                </Button>

                <Button
                  disabled={!canUndo}
                  onClick={updateContent}
                  isLoading={isLoading}
                >
                  Lagre
                </Button>
              </div>
            </Card>
          </>
        )}
      </PageLayout>
    </>
  );
};

export default AboutPage;
