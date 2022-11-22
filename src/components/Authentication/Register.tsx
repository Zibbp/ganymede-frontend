import { useToggle, upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
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
} from "@mantine/core";
import { IconLock } from "@tabler/icons";
import { useState } from "react";
import router from "next/router";
import Link from "next/link";
import { useRegister } from "../../hooks/useRegister";

export function RegisterForm(props: PaperProps) {
  const { register } = useRegister();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
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
    // validate form
    form.validate();

    setLoading(true);
    try {
      const err = await register(form.values.username, form.values.password);
      setLoading(false);
      if (err) {
        return;
      }
      router.push("/login");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" weight={500}>
        Welcome to Ganymede, sign up below
      </Text>

      <div style={{ marginBottom: "0.5rem" }}></div>

      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            required
            label="Username"
            placeholder="username"
            value={form.values.username}
            onChange={(event) =>
              form.setFieldValue("username", event.currentTarget.value)
            }
            error={form.errors.user && "Invalid username"}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="password"
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={
              form.errors.password &&
              "Password should include at least 8 characters"
            }
          />
        </Stack>

        <Group position="apart" mt="xl">
          <Link href="/login">
            <Anchor component="button" type="button" color="dimmed" size="xs">
              Have an account? Login
            </Anchor>
          </Link>
          <Button color="violet" type="submit" loading={loading}>
            Sign up
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export function SSOButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      leftIcon={<IconLock size={16} />}
      style={{ width: "100%" }}
      sx={(theme) => ({
        backgroundColor:
          theme.colors.dark[theme.colorScheme === "dark" ? 9 : 6],
        color: "#fff",
        "&:hover": {
          backgroundColor:
            theme.colors.dark[theme.colorScheme === "dark" ? 9 : 6],
        },
      })}
    />
  );
}
