import { TenantRole } from '@/server/db/schema';
import { useTenantStore } from '@/store/tenantStore';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useTenantAuthorization = (roles: TenantRole[], to = '/') => {
  const router = useRouter();
  const { activeTenantRole } = useTenantStore();

  useEffect(() => {
    if (activeTenantRole && !roles.includes(activeTenantRole)) {
      router.push(to);
    }
  }, [activeTenantRole]);
};
