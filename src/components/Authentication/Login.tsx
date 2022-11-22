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
import { useLogin } from "../../hooks/useLogin";
import { useState } from "react";
import router from "next/router";
import Link from "next/link";

const showSSOLoginButton = process.env.NEXT_PUBLIC_SHOW_SSO_LOGIN_BUTTON;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function LoginForm(props: PaperProps) {
  const { login } = useLogin();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },

    validate: {
      password: (val) =>
        val.length <= 8
          ? "Password should include at least 8 characters"
          : null,
    },
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
      <Text size="lg" weight={500}>
        Welcome to Ganymede
      </Text>

      {showSSOLoginButton == "true" ? (
        <div>
          <Group grow mb="md" mt="md">
            <Link href={`${apiUrl}/api/v1/auth/oauth/login`}>
              <SSOButton>Login with SSO</SSOButton>
            </Link>
          </Group>
          <Divider
            label="Or continue with username"
            labelPosition="center"
            my="lg"
          />
        </div>
      ) : (
        <div style={{ marginBottom: "0.5rem" }}></div>
      )}

      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            required
            label="Username"
            placeholder="Your username"
            value={form.values.username}
            onChange={(event) =>
              form.setFieldValue("username", event.currentTarget.value)
            }
            error={form.errors.user && "Invalid username"}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
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
          <Link href="register">
            <Anchor component="button" type="button" color="dimmed" size="xs">
              Don't have an account? Register
            </Anchor>
          </Link>
          <Button color="violet" type="submit" loading={loading}>
            Login
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
