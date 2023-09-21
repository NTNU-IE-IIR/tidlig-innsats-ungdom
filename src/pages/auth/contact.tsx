import Card from '@/components/container/Card';
import { api } from '@/utils/api';
import { IconChevronLeft, IconMail } from '@tabler/icons-react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Fragment } from 'react';

const ContactPage: NextPage = () => {
  const { data: contacts } = api.userAccount.listContacts.useQuery();

  return (
    <>
      <Head>
        <title>Logg inn - Tidlig innsats ungdom</title>
      </Head>
      <main className='m-auto flex h-screen max-w-sm flex-col justify-center'>
        <h1 className='text-center text-xl font-bold'>Tidlig innsats ungdom</h1>

        <span className='text-center font-medium'>
          Kontakt en administrator
        </span>

        <Card className='mt-1 space-y-1 p-2'>
          {(contacts === undefined || contacts.length === 0) && (
            <p className='my-8 text-sm text-gray-700'>
              Fant ingen registrerte kontakter.
            </p>
          )}

          {contacts?.map((contact, i, arr) => (
            <Fragment key={contact.email}>
              <a
                href={`mailto:${contact.email}`}
                className='flex rounded-md border border-transparent px-2 py-1 hover:border-gray-200 hover:bg-gray-50'
              >
                <div>
                  <p className='-mb-1 font-semibold'>{contact.fullName}</p>
                  <p className='text-sm text-cyan-500'>{contact.email}</p>
                </div>

                <IconMail className='ml-auto self-center text-gray-600' />
              </a>

              {i !== arr.length - 1 && <hr />}
            </Fragment>
          ))}
        </Card>

        <Link
          href='/auth/login'
          className='mt-1 flex items-center justify-center'
        >
          <IconChevronLeft className='h-5 w-5' />
          <span className='font-medium'>Tilbake til innlogging</span>
        </Link>
      </main>
    </>
  );
};

export default ContactPage;
