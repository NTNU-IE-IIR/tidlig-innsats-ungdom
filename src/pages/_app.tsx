import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '@/utils/api';

import '@/styles/globals.css';
import 'dayjs/locale/nb';
import '@/i18n';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';

dayjs.locale('nb');
dayjs.extend(relativeTime);
dayjs.extend(duration);

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <TooltipProvider>
        <Component {...pageProps} />
      </TooltipProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
