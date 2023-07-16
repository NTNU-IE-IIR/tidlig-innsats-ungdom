import { createThemeSchema, updateThemeSchema } from '@/schemas/themeSchemas';
import { ThemeNode } from '@/types/themes';
import type { RouterOutputs } from '@/utils/api';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import {
  IconBaguette,
  IconCheck,
  IconHeart,
  IconHeartFilled,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../input/Button';
import TextField from '../input/TextField';
import UploadThemeIcon from './UploadThemeIcon';
import { useTenantStore } from '@/store/tenantStore';

type FormResult =
  | RouterOutputs['theme']['addTheme']
  | RouterOutputs['theme']['updateTheme'];

export interface ThemeFormProps {
  themeId?: number;
  onSuccess: (theme: FormResult) => void;
  onCancel: () => void;
}

const ThemeForm: React.FC<ThemeFormProps> = ({
  themeId,
  onSuccess: emitSuccess,
  onCancel,
}) => {
  const { activeTenantId } = useTenantStore();
  const shouldUpdate = themeId !== undefined;
  const { data: existingTheme } = api.theme.getThemeById.useQuery(themeId!, {
    enabled: shouldUpdate,
  });

  const excludeIds = themeId ? [themeId] : undefined;
  const { data: parentCandidates } = api.theme.listThemeTree.useQuery({
    excludeIds,
  });

  const utils = api.useContext();

  const onSuccess = (theme: FormResult) => {
    emitSuccess(theme);
    utils.theme.listThemeTree.invalidate(); // NOSONAR
    if (themeId) utils.theme.getThemeById.invalidate(themeId); // NOSONAR
  };

  const { mutate: create } = api.theme.addTheme.useMutation({
    onSuccess,
  });
  const { mutate: update } = api.theme.updateTheme.useMutation({
    onSuccess,
  });

  // TODO: Find a way to properly type this
  const handleSubmit = async (values: any) => {
    let iconUrl: string | null = null;

    if (fileToUpload) {
      const formData = new FormData();

      formData.append('file', fileToUpload);

      const response = await fetch(`/api/static/${activeTenantId}/upload`, {
        method: 'POST',
        body: formData,
      });

      const { fileId } = await response.json();

      iconUrl = `/api/static/${activeTenantId}/${fileId}`;
    }

    if (shouldUpdate) {
      update({
        id: values.id,
        name: values.name,
        shortDescription: values.shortDescription,
        iconUrl: iconUrl ?? existingTheme?.iconUrl ?? null,
        parentId: values.parentId,
      });
    } else {
      create({
        name: values.name,
        shortDescription: values.shortDescription,
        iconUrl,
        parentId: values.parentId,
      });
    }
  };

  const form = useForm<{
    id: number | undefined;
    name: string;
    shortDescription: string;
    iconUrl: string | null;
    parentId: number | null;
  }>({
    validate: zodResolver(shouldUpdate ? updateThemeSchema : createThemeSchema),
    initialValues: {
      id: undefined,
      name: '',
      shortDescription: '',
      iconUrl: null,
      parentId: null,
    },
  });

  useEffect(() => {
    if (existingTheme) {
      form.setValues({
        id: existingTheme.id,
        name: existingTheme.name,
        shortDescription: existingTheme.shortDescription,
        parentId: existingTheme.parentId,
      });
    }
  }, [existingTheme]);

  const handleThemeSelected = (theme: ThemeNode) => {
    if (form.values.parentId === theme.id) {
      form.setFieldValue('parentId', null);
      return;
    }

    form.setFieldValue('parentId', theme.id);
  };

  const [fileToUpload, setFileToUpload] = useState<File>();

  return (
    <form
      onSubmit={form.onSubmit((values) => handleSubmit(values))}
      className='flex h-96 overflow-hidden py-2'
    >
      <section className='flex w-1/2 flex-col gap-2 px-2'>
        <h2 className='font-semibold'>Tema informasjon</h2>

        <TextField label='Navn' {...form.getInputProps('name')} />

        <TextField
          label='Kort beskrivelse'
          {...form.getInputProps('shortDescription')}
        />

        {existingTheme && (
          <p className='text-sm text-zinc-600'>
            Opprettet for {dayjs(existingTheme?.createdAt).fromNow()}
          </p>
        )}

        <h2 className='font-semibold'>Ikon</h2>

        <UploadThemeIcon
          existingImage={existingTheme?.iconUrl ?? undefined}
          fileToUpload={fileToUpload}
          onFileChanged={setFileToUpload}
        />

        <div className='mt-auto flex items-center gap-1 self-end text-sm'>
          <Button type='submit'>Lagre</Button>
          <Button onClick={onCancel} variant='neutral'>
            Avbryt
          </Button>
        </div>
      </section>

      <section className='flex w-1/2 flex-col overflow-hidden border-l border-zinc-300 px-2'>
        <h2 className='font-semibold'>Overordnet tema</h2>

        <button
          type='button'
          onClick={() => form.setFieldValue('parentId', null)}
          className={twMerge(
            'mb-2 flex items-center justify-center gap-1 rounded-md border py-0.5',
            form.values.parentId !== null && 'border-zinc-400 text-zinc-400',
            form.values.parentId === null &&
              'border-emerald-500 bg-emerald-50 text-emerald-600'
          )}
        >
          <IconCheck className='h-5 w-5' />
          <span className='text-sm'>Har ikke overordnet tema</span>
        </button>

        <ul className='divide-y overflow-y-auto overflow-x-hidden pr-2'>
          {parentCandidates?.map((theme) => (
            <ThemeListNodeFlat
              key={theme.id}
              theme={theme}
              indent={1}
              isSelected={(id) => form.values.parentId === id}
              onSelect={handleThemeSelected}
            />
          ))}
        </ul>
      </section>
    </form>
  );
};

interface ThemeListNodeFlatProps {
  theme: ThemeNode;
  indent: number;
  onSelect: (theme: ThemeNode) => void;
  isSelected: (id: number) => boolean;
}

const ThemeListNodeFlat: React.FC<ThemeListNodeFlatProps> = ({
  theme,
  indent,
  onSelect,
  isSelected,
}) => {
  const selected = isSelected(theme.id);

  return (
    <>
      <li onClick={() => onSelect(theme)} className='relative py-0.5'>
        <div
          className={twMerge(
            'flex cursor-pointer items-center gap-1 overflow-hidden border py-0.5 pr-2 text-sm font-medium',
            selected &&
              'rounded-md border-emerald-500 bg-emerald-50 text-emerald-500',
            !selected && 'border-transparent'
          )}
          style={{
            paddingLeft: `${indent * 0.5}rem`,
          }}
        >
          <div
            className={twMerge(
              'h-2 w-2 rounded-full border',
              selected && 'border-emerald-500 bg-emerald-300',
              !selected && 'border-zinc-400 bg-zinc-200'
            )}
          />
          <span className='truncate'>{theme.name}</span>
        </div>
      </li>

      {theme.children.map((child) => (
        <ThemeListNodeFlat
          key={child.id}
          theme={child}
          indent={indent + 1}
          onSelect={onSelect}
          isSelected={isSelected}
        />
      ))}
    </>
  );
};

export default ThemeForm;
