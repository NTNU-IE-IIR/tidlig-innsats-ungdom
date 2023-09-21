import {
  CreateInvitationInput,
  createInvitationSchema,
} from '@/schemas/invitationSchemas';
import { useTenantStore } from '@/store/tenantStore';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../input/Button';
import NumberField from '../input/NumberField';
import Switch from '../input/Switch';
import TextField from '../input/TextField';

interface InviteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InviteForm: React.FC<InviteFormProps> = ({ onSuccess, onCancel }) => {
  const { activeTenantId } = useTenantStore();
  const utils = api.useContext();
  const { mutateAsync: createInvite, isLoading } =
    api.invitation.createInvite.useMutation({
      onSuccess: () => {
        utils.invitation.listInvites.invalidate();
        utils.invitation.getInvite.invalidate();
      },
    });

  const form = useForm<CreateInvitationInput>({
    validate: zodResolver(createInvitationSchema),
    initialValues: {
      tenantId: activeTenantId ?? '',
      comment: '',
      maxUses: 1,
    },
  });

  const [limitUses, setLimitUses] = useState(false);

  const handleSubmit = async (values: CreateInvitationInput) => {
    await createInvite({
      ...values,
      maxUses: limitUses ? values.maxUses : undefined,
    });

    onSuccess?.();
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className='flex flex-col gap-2 p-2'
    >
      <h1 className='text-lg font-bold'>Opprett invitasjon</h1>

      <p className='mb-2 text-sm text-gray-600'>
        Invitasjonen kan brukes for å tillate registrering av nye kontoer. Vi
        gir deg en lenke som du kan sende til nye brukere for registrering.
        Invitasjonen varer i 7 dager.
      </p>

      <TextField label='Kommentar' {...form.getInputProps('comment')} />

      <div className='mb-2 flex items-center gap-2'>
        <Switch
          label='Begrens antall anvendelser'
          checked={limitUses}
          onChange={setLimitUses}
        />

        <span className='text-sm'>Begrens antall anvendelser</span>
      </div>

      <NumberField
        label='Maks antall bruk'
        min={1}
        max={100}
        className={twMerge(!limitUses && 'invisible')}
        {...form.getInputProps('maxUses')}
      />

      <div className='flex items-center justify-end gap-2 text-sm'>
        <Button variant='neutral' onClick={onCancel}>
          Avbryt
        </Button>
        <Button type='submit' isLoading={isLoading}>
          Opprett
        </Button>
      </div>
    </form>
  );
};

export default InviteForm;
