import {
  UpdateUserAccountInput,
  updateUserAccountSchema,
} from '@/schemas/userAccountSchemas';
import { useForm, zodResolver } from '@mantine/form';
import TextField from '../input/TextField';
import { useState } from 'react';
import { api } from '@/utils/api';
import Button from '../input/Button';
import Switch from '../input/Switch';
import ErrorLabel from '../feedback/ErrorLabel';
import Alert from '../feedback/Alert';
import { useTranslation } from 'react-i18next';

export interface EditUserFormProps {
  id: string;
  fullName: string;
  email: string;
  isCurrentUser?: boolean;
  onSuccess?: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  id,
  fullName,
  email,
  isCurrentUser,
  onSuccess,
}) => {
  const [changePassword, setChangePassword] = useState(false);
  const { t } = useTranslation();

  const { getInputProps, onSubmit, errors } = useForm<UpdateUserAccountInput>({
    validate: zodResolver(updateUserAccountSchema),
    initialValues: {
      id,
      fullName,
      email,
    },
  });

  const utils = api.useContext();

  const {
    mutate: updateUserAccount,
    isLoading,
    isError,
    error,
  } = api.userAccount.updateUserAccount.useMutation({
    onSuccess: () => {
      utils.userAccount.listUsers.invalidate();
      utils.userAccount.listContacts.invalidate();
      utils.tenant.listMembers.invalidate();
      onSuccess?.();
    },
  });

  const processSubmit = (values: UpdateUserAccountInput) => {
    updateUserAccount(values);
  };

  const TRANSLATE_PREFIX = 'USER_REGISTRATION';

  return (
    <form onSubmit={onSubmit(processSubmit)} className='flex flex-col gap-2'>
      <TextField label='Fullt navn' {...getInputProps('fullName')} />

      <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
        {errors.fullName}
      </ErrorLabel>

      <TextField label='E-post' {...getInputProps('email')} />

      <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
        {errors.email}
      </ErrorLabel>

      {isCurrentUser && (
        <>
          <TextField
            type='password'
            label='Gjeldende passord'
            {...getInputProps('currentPassword')}
          />

          <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
            {errors.currentPassword}
          </ErrorLabel>
        </>
      )}

      <div className='flex items-center gap-2'>
        <Switch
          checked={changePassword}
          onChange={setChangePassword}
          label='Endre passord'
        />

        <span className='text-sm'>Endre passord</span>
      </div>

      {changePassword && (
        <>
          <TextField
            type='password'
            label='Nytt passord'
            {...getInputProps('newPassword')}
          />

          <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
            {errors.newPassword}
          </ErrorLabel>

          <TextField
            type='password'
            label='Bekreft nytt passord'
            {...getInputProps('newPasswordConfirmation')}
          />

          <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
            {errors.passwordConfirmation}
          </ErrorLabel>
        </>
      )}

      {isCurrentUser && (
        <Alert intent='info' className='text-sm'>
          Når du lagrer endringene vil du bli logget ut av din brukerkonto, og
          du må logge inn på nytt.
        </Alert>
      )}

      <Button type='submit' className='text-sm' isLoading={isLoading}>
        Lagre endringer
      </Button>

      {isError && (
        <Alert intent='error'>
          {t('USER_REGISTRATION.'.concat(error.message))}
        </Alert>
      )}
    </form>
  );
};

export default EditUserForm;
