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
} from '@mantine/core';
import Link from 'next/link';
import getConfig from 'next/config';
import { useState } from 'react';
import router from 'next/router';
import { useRegister } from '../../hooks/useRegister';

export function RegisterForm(props: PaperProps) {
  const { publicRuntimeConfig } = getConfig();
  const { register } = useRegister();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },

    validate: {
      password: (val) =>
        val.length <= 7
          ? "Password should include at least 8 characters"
          : null,
    },
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    form.validate();
    setLoading(true);
    try {
      const err = await register(form.values.username, form.values.password);
      setLoading(false);
      if (err) {
        throw new Error(err);
      }
      router.push("/login");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" fw={500}>
        Welcome to Ganymede, sign up below
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack>

          <TextInput
            required
            label="Username"
            placeholder="Your username"
            value={form.values.username}
            onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
            radius="md"
            error={form.errors.user && "Invalid username"}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            radius="md"
            error={
              form.errors.password &&
              "Password should include at least 8 characters"
            }
          />


        </Stack>

        <Group justify="space-between" mt="xl">
          <Link href="/login">
            <Anchor component="button" type="button" c="dimmed" size="xs">
              Have an account? Login
            </Anchor>
          </Link>
          <Button type="submit" radius="xl" loading={loading}>
            Register
          </Button>
        </Group>
      </form>
    </Paper>
  );
}