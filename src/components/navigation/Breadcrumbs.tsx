import { useBrowseStore } from '@/store/browseStore';
import { IconHome } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

interface BreadcrumbsProps {}

const Breadcrumbs: React.FC<BreadcrumbsProps> = () => {
  const router = useRouter();
  const { drill, navigateBackTo, navigateHome } = useBrowseStore();

  return (
    <div className='flex items-center justify-center gap-1 py-2 font-semibold'>
      <button onClick={() => navigateHome(router)}>
        <IconHome className='h-5 w-5' />
      </button>
      {drill.map((theme, i) => (
        <Fragment key={theme.discriminator.concat('' + theme.id)}>
          <span>/</span>
          <button onClick={() => navigateBackTo(theme, i, router)} className='line-clamp-1 truncate'>
            {theme.name}
          </button>
        </Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
