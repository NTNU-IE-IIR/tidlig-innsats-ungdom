import Card from '@/components/container/Card';
import Button from '@/components/input/Button';
import Switch from '@/components/input/Switch';
import TextField from '@/components/input/TextField';
import { ConfigureInput, configureSchema } from '@/schemas/appSettingsSchemas';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import { IconChevronRight } from '@tabler/icons-react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Wizard: NextPage = () => {
  // TODO: Redirect to index if already configured
  const { mutateAsync: configure } = api.appSettings.configure.useMutation();
  const form = useForm<ConfigureInput>({
    validate: zodResolver(configureSchema),
    initialValues: {
      registrationEnabled: false,
      tenantName: '',
    },
  });

  const router = useRouter();

  const onFormSubmit = async (values: ConfigureInput) => {
    try {
      await configure(values);
      router.push('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Head>
        <title>Velkommen - Tidlig innsats ungdom</title>
      </Head>
      <main className='m-auto flex h-screen max-w-sm flex-col justify-center'>
        <h1 className='text-center text-xl font-bold'>Sett opp ditt miljø</h1>

        <Card>
          <form
            className='flex flex-col'
            onSubmit={form.onSubmit((values) => onFormSubmit(values))}
          >
            <TextField
              label='Navn'
              className='my-2'
              {...form.getInputProps('tenantName', {
                withError: true,
              })}
            />

            <div className='flex items-center gap-2'>
              <Switch
                label='Tillat registrering'
                checked={form.values.registrationEnabled}
                onChange={(value) =>
                  form.setFieldValue('registrationEnabled', value)
                }
              />
              <p className='text-sm font-medium'>Tillatt registrering</p>
            </div>

            <Button className='mt-4 flex w-fit self-end py-1.5 text-sm'>
              <span>Neste</span>
              <IconChevronRight className='-mr-1 h-4 w-4' />
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
};

export default Wizard;
