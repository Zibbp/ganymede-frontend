import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  ButtonProps,
} from '@mantine/core';
import Link from 'next/link';
import getConfig from 'next/config';
import { useLogin } from '../../hooks/useLogin';
import { useState } from 'react';
import router from 'next/router';
import { IconLock } from '@tabler/icons-react';

export function LoginForm(props: PaperProps) {
  const { publicRuntimeConfig } = getConfig();
  const { login } = useLogin();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    }
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.values.username, form.values.password);
      setLoading(false);
      router.push("/");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" fw={500}>
        Welcome to Ganymede, login below
      </Text>

      {publicRuntimeConfig.SHOW_SSO_LOGIN_BUTTON != "false" && (
        <div>
          <Group grow mb="md" mt="md">
            <Link
              href={`${publicRuntimeConfig.API_URL}/api/v1/auth/oauth/login`}
            >
              <SSOButton>Login with SSO</SSOButton>
            </Link>
          </Group>
          <Divider
            label="Or continue with username"
            labelPosition="center"
            my="lg"
          />
        </div>
      )}


      <form onSubmit={handleSubmit}>
        <Stack>

          <TextInput
            required
            label="Username"
            placeholder="Your username"
            value={form.values.username}
            onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            radius="md"
          />


        </Stack>

        <Group justify="space-between" mt="xl">
          <Link href="/register">
            <Anchor component="button" type="button" c="dimmed" size="xs">
              Don't have an account? Register
            </Anchor>
          </Link>
          <Button type="submit" radius="xl" loading={loading}>
            Login
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export function SSOButton(props: ButtonProps) {
  return (
    <Button fullWidth>Login With SSO</Button>
  );
}