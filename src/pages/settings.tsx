import Card from '@/components/container/Card';
import Button from '@/components/input/Button';
import InviteForm from '@/components/invite/InviteForm';
import PageLayout from '@/components/layout/PageLayout';
import Dialog from '@/components/overlay/Dialog';
import TenantInvites from '@/components/tenant/TenantInvites';
import TenantMembers from '@/components/tenant/TenantMembers';
import { Tab as HeadlessTab } from '@headlessui/react';
import { NextPage } from 'next';
import Head from 'next/head';
import React, { Fragment, useState } from 'react';

const Settings: NextPage = () => {
  const [showInviteForm, setShowInviteForm] = useState(false);

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='flex gap-2'>
        <HeadlessTab.Group
          as={Card}
          pad={false}
          className='flex w-2/3 flex-col'
        >
          <HeadlessTab.List className='flex rounded-t-md border-b border-zinc-300 bg-zinc-50 px-1'>
            <Tab>Medlemmer</Tab>
            <Tab>Tidligere medlemmer</Tab>
            <Tab>Alle brukere</Tab>
          </HeadlessTab.List>

          <HeadlessTab.Panels as={Fragment}>
            <HeadlessTab.Panel as={Fragment}>
              <TenantMembers />
            </HeadlessTab.Panel>
            <HeadlessTab.Panel as={Fragment}>
              <TenantMembers />
            </HeadlessTab.Panel>

            <HeadlessTab.Panel as={Fragment}>
              <p>Alle brukere</p>
            </HeadlessTab.Panel>
          </HeadlessTab.Panels>
        </HeadlessTab.Group>

        <HeadlessTab.Group
          as={Card}
          pad={false}
          className='flex w-1/3 flex-col'
        >
          <HeadlessTab.List className='flex rounded-t-md border-b border-zinc-300 bg-zinc-50 px-1'>
            <Tab>Åpne invitasjoner</Tab>
            <Tab>Utgåtte invitasjoner</Tab>
          </HeadlessTab.List>
          <HeadlessTab.Panels className='flex-1'>
            <HeadlessTab.Panel>
              <TenantInvites />
            </HeadlessTab.Panel>
            <HeadlessTab.Panel>
              <TenantInvites expired />
            </HeadlessTab.Panel>
          </HeadlessTab.Panels>

          <Button
            className='m-2 text-sm'
            onClick={() => setShowInviteForm(true)}
          >
            Ny invitasjon
          </Button>
        </HeadlessTab.Group>
      </PageLayout>

      <Dialog open={showInviteForm} onClose={() => setShowInviteForm(false)}>
        {({ close }) => <InviteForm onSuccess={close} onCancel={close} />}
      </Dialog>
    </>
  );
};

interface TabProps {
  children?: React.ReactNode;
}

const Tab: React.FC<TabProps> = ({ children }) => {
  return (
    <HeadlessTab className='-mb-px border-b-2 border-zinc-300 px-2 py-1 font-medium outline-none ui-selected:border-emerald-500'>
      {children}
    </HeadlessTab>
  );
};

export default Settings;
