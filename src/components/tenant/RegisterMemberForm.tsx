import { CreateMemberInput, createMemberSchema } from '@/schemas/tenantSchemas';
import { TenantRole } from '@/server/db/schema';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import ErrorLabel from '../feedback/ErrorLabel';
import Button from '../input/Button';
import TextField from '../input/TextField';

interface RegisterMemberFormProps {
  tenant?: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TRANSLATE_PREFIX = 'USER_REGISTRATION';

const RegisterMemberForm: React.FC<RegisterMemberFormProps> = ({
  tenant,
  onSuccess,
  onCancel,
}) => {
  const utils = api.useContext();
  const { mutateAsync: registerMember, isLoading } =
    api.tenant.registerMember.useMutation({
      onSuccess: () => {
        utils.tenant.listMembers.invalidate();
        onSuccess?.();
      },
    });

  const form = useForm<CreateMemberInput>({
    validate: zodResolver(createMemberSchema),
    initialValues: {
      tenantId: tenant?.id ?? '',
      role: TenantRole.USER,
      userAccount: {
        email: '',
        fullName: '',
        password: '',
        passwordConfirmation: '',
      },
    },
  });

  const handleSubmit = async (values: CreateMemberInput) => {
    if (tenant) {
      await registerMember(values);
    }
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className='flex flex-col gap-2 p-4'
    >
      <h1 className='text-lg font-bold'>Opprett nytt medlem</h1>

      <p className='font-gray-600 text-sm'>
        Du kan også benytte invitasjoner for å la de selv velge et passord.
      </p>

      <section>
        <TextField
          label='Fullt navn'
          {...form.getInputProps('userAccount.fullName')}
        />
        <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
          {form.errors['userAccount.fullName']}
        </ErrorLabel>

        <TextField
          className='mt-3'
          label='E-post'
          {...form.getInputProps('userAccount.email', { withError: true })}
        />
        <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
          {form.errors['userAccount.email']}
        </ErrorLabel>

        <TextField
          className='mt-3'
          type='password'
          label='Passord'
          {...form.getInputProps('userAccount.password', { withError: true })}
        />
        <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
          {form.errors['userAccount.password']}
        </ErrorLabel>

        <TextField
          className='mt-3'
          type='password'
          label='Bekreft passord'
          {...form.getInputProps('userAccount.passwordConfirmation', {
            withError: true,
          })}
        />
        <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
          {form.errors['userAccount.passwordConfirmation']}
        </ErrorLabel>
      </section>

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

export default RegisterMemberForm;
