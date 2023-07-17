import Card from '@/components/container/Card';
import Button from '@/components/input/Button';
import InviteForm from '@/components/invite/InviteForm';
import PageLayout from '@/components/layout/PageLayout';
import Dialog from '@/components/overlay/Dialog';
import TenantInvites from '@/components/tenant/TenantInvites';
import TenantMembers from '@/components/tenant/TenantMembers';
import UserAccountList from '@/components/user/UserAccountsList';
import { Tab as HeadlessTab } from '@headlessui/react';
import { NextPage } from 'next';
import Head from 'next/head';
import React, { Fragment, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const Settings: NextPage = () => {
  const [showInviteForm, setShowInviteForm] = useState(false);

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='grid grid-cols-1 gap-2 md:grid-cols-3'>
        <HeadlessTab.Group
          as={Card}
          pad={false}
          className='flex flex-col md:hidden'
        >
          <HeadlessTab.List className='flex overflow-x-auto overflow-y-clip rounded-t-md border-b border-zinc-300 bg-zinc-50 px-1'>
            <Tab>Medlemmer</Tab>
            <Tab>Tidligere medlemmer</Tab>
            <Tab>Alle brukere</Tab>
            <Tab>Åpne invitasjoner</Tab>
            <Tab>Utgåtte invitasjoner</Tab>
          </HeadlessTab.List>

          <HeadlessTab.Panels as={Fragment}>
            <HeadlessTab.Panel as={TenantMembers} />
            <HeadlessTab.Panel as={TenantMembers} deleted />
            <HeadlessTab.Panel as={UserAccountList} />
            <HeadlessTab.Panel as={TenantInvites} />
            <HeadlessTab.Panel as={TenantInvites} expired />
          </HeadlessTab.Panels>
        </HeadlessTab.Group>

        <HeadlessTab.Group
          as={Card}
          pad={false}
          className='col-span-2 flex flex-col max-md:hidden'
        >
          <HeadlessTab.List className='flex rounded-t-md border-b border-zinc-300 bg-zinc-50 px-1'>
            <Tab>Medlemmer</Tab>
            <Tab>Tidligere medlemmer</Tab>
            <Tab>Alle brukere</Tab>
          </HeadlessTab.List>

          <HeadlessTab.Panels as={Fragment}>
            <HeadlessTab.Panel as={TenantMembers} />
            <HeadlessTab.Panel as={TenantMembers} deleted />
            <HeadlessTab.Panel as={UserAccountList} />
          </HeadlessTab.Panels>
        </HeadlessTab.Group>

        <HeadlessTab.Group
          as={Card}
          pad={false}
          className='col-span-1 flex flex-col max-md:hidden'
        >
          <HeadlessTab.List className='flex rounded-t-md border-b border-zinc-300 bg-zinc-50 px-1'>
            <Tab>Åpne invitasjoner</Tab>
            <Tab>Utgåtte invitasjoner</Tab>
          </HeadlessTab.List>
          <HeadlessTab.Panels className='flex-1'>
            <HeadlessTab.Panel as={TenantInvites} />
            <HeadlessTab.Panel as={TenantInvites} expired />
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
  className?: string;
}

const Tab: React.FC<TabProps> = ({ children, className }) => {
  return (
    <HeadlessTab
      className={twMerge(
        '-mb-px border-b-2 border-zinc-300 px-2 py-1 font-medium outline-none ui-selected:border-emerald-500',
        className
      )}
    >
      {children}
    </HeadlessTab>
  );
};

export default Settings;
