import Card from '@/components/container/Card';
import TextEditor from '@/components/editor/TextEditor';
import Button from '@/components/input/Button';
import TextField from '@/components/input/TextField';
import PageLayout from '@/components/layout/PageLayout';
import ThemeListNode from '@/components/theme/ThemeListNode';
import { api } from '@/utils/api';
import { EditorState } from 'lexical';
import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';

const ManagePage: NextPage = () => {
  const { data: themes } = api.theme.listThemeTree.useQuery({});
  const [editorState, setEditorState] = useState<EditorState>();

  const submit = () => {
    console.log(editorState?.toJSON());
  };

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='grid grid-cols-3 gap-4 px-1'>
        <section className='col-span-2 flex flex-col'>
          <h2 className='text-lg font-bold'>Nytt innhold</h2>
          <Card className='flex-1 flex flex-col gap-2 py-2'>
            <TextField label='Navn' />

            <TextEditor name='media' onEditorChange={setEditorState} className='flex-1' />

            <Button className='self-end' onClick={submit}>
              Lagre
            </Button>
          </Card>
        </section>

        <aside className='flex flex-col'>
          <h2 className='text-lg font-bold'>Knytt til en/flere tema</h2>
          <Card className='flex-1'>
            <ul>
              {themes?.map((theme) => (
                <ThemeListNode key={theme.id} theme={theme} />
              ))}
            </ul>
          </Card>
        </aside>
      </PageLayout>
    </>
  );
};

export default ManagePage;
