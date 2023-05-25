import { createThemeSchema, updateThemeSchema } from '@/schemas/themeSchemas';
import { ThemeNode } from '@/types/themes';
import type { RouterOutputs } from '@/utils/api';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import Button from '../input/Button';
import TextField from '../input/TextField';
import { IconCheck } from '@tabler/icons-react';

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
  const handleSubmit = (values: any) => {
    if (shouldUpdate) {
      update({
        id: values.id,
        name: values.name,
        shortDescription: values.shortDescription,
        parentId: values.parentId,
      });
    } else {
      create({
        name: values.name,
        shortDescription: values.shortDescription,
        parentId: values.parentId,
      });
    }
  };

  const form = useForm<{
    id: number | undefined;
    name: string;
    shortDescription: string;
    parentId: number | null;
  }>({
    validate: zodResolver(shouldUpdate ? updateThemeSchema : createThemeSchema),
    initialValues: {
      id: undefined,
      name: '',
      shortDescription: '',
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
          onClick={() => form.setFieldValue('parentId', null)}
          className={clsx(
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
          className={clsx(
            'flex cursor-pointer items-center gap-1 overflow-hidden border pr-2 font-medium text-sm py-0.5',
            selected && 'rounded-md border-emerald-500 bg-emerald-50 text-emerald-500',
            !selected && 'border-transparent'
          )}
          style={{
            paddingLeft: `${indent * 0.5}rem`,
          }}
        >
          <div
            role='checkbox'
            className={clsx(
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
