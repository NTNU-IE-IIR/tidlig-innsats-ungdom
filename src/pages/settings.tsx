import Card from '@/components/container/Card';
import PageLayout from '@/components/layout/PageLayout';
import TenantInvites from '@/components/tenant/TenantInvites';
import TenantMembers from '@/components/tenant/TenantMembers';
import { Tab as HeadlessTab } from '@headlessui/react';
import { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';

const Settings: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='flex'>
        <Card pad={false} className='flex flex-1 flex-col'>
          <HeadlessTab.Group>
            <HeadlessTab.List className='flex rounded-t-md border-b border-zinc-300 bg-zinc-50 px-1'>
              <Tab>Medlemmer</Tab>
              <Tab>Invitasjoner</Tab>
            </HeadlessTab.List>
            <HeadlessTab.Panels>
              <HeadlessTab.Panel>
                <TenantMembers />
              </HeadlessTab.Panel>

              <HeadlessTab.Panel>
                <TenantInvites />
              </HeadlessTab.Panel>
            </HeadlessTab.Panels>
          </HeadlessTab.Group>
        </Card>
      </PageLayout>
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
