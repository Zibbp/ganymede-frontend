import Router from "next/router";
import { useEffect, useState } from "react";
import { Authorization, ROLES } from "../components/ProtectedRoute";
import useUserStore from "../store/user";
import { roleCheck } from "../hooks/useAuthorization";
import { deleteCookie } from "cookies-next";
import {
  Card,
  Avatar,
  Text,
  Group,
  Button,
  Center,
  Modal,
  PasswordInput,
  Switch,
  Divider,
} from "@mantine/core";
import { useDocumentTitle, useInputState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useApi } from "../hooks/useApi";

const ProfilePage = () => {
  const user = useUserStore((state) => state);
  const [opened, setOpened] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [oldPassword, setOldPassword] = useInputState("");
  const [password, setPassword] = useInputState("");
  const [passwordConfirm, setPasswordConfirm] = useInputState("");
  const [useNewChatPlayer, setUseNewChatPlayer] = useState(false);
  const [showMoreUIDetails, setShowMoreUIDetails] = useState(false);


  useDocumentTitle("Profile - Ganymede");

  useEffect(() => {
    setUseNewChatPlayer(user.settings.useNewChatPlayer);
    setShowMoreUIDetails(user.settings.moreUIDetails);
  }, []);

  const updateUserSettings = async () => {
    useUserStore.setState({
      settings: {
        useNewChatPlayer: useNewChatPlayer,
        moreUIDetails: showMoreUIDetails,
      },
    });
    localStorage.setItem(
      "ganymedeUserSettings",
      JSON.stringify(useUserStore.getState().settings)
    );
    showNotification({
      autoClose: 2000,
      title: "Settings",
      message: "Settings updated successfully",
      styles: (theme) => ({
        root: {
          backgroundColor: theme.colors.green[6],
          borderColor: theme.colors.green[6],

          "&::before": { backgroundColor: theme.white },
        },

        title: { color: theme.white },
        description: { color: theme.white },
        closeButton: {
          color: theme.white,
          "&:hover": { backgroundColor: theme.colors.blue[7] },
        },
      }),
    });
  };

  const logout = () => {
    deleteCookie("access-token");
    deleteCookie("refresh-token");
    useUserStore.setState({
      isLoggedIn: false,
      id: "",
      username: "",
      role: "",
      updatedAt: "",
      createdAt: "",
    });
    Router.push("/login");
  };

  const submitPasswordChange = async (e: any) => {
    e.preventDefault();
    console.log("submitPasswordChange");
    console.log(oldPassword, password, passwordConfirm);
    if (password !== passwordConfirm) {
      showNotification({
        title: "Change Password",
        message: "Passwords do not match",
        color: "red",
      });
      return;
    }
    try {
      setPasswordChangeLoading(true);
      await useApi(
        {
          method: "POST",
          url: "/api/v1/auth/change-password",
          data: {
            old_password: oldPassword,
            new_password: password,
            confirm_new_password: passwordConfirm,
          },
          withCredentials: true,
        },
        false
      );
      showNotification({
        title: "Change Password",
        message: "Password changed successfully",
      });
      setOldPassword("");
      setPassword("");
      setPasswordConfirm("");
      setPasswordChangeLoading(false);
      setOpened(false);
    } catch (error) {
      setPasswordChangeLoading(false);
    }
  };

  return (
    <Authorization>
      <div>
        <Center mt={25}>
          <Card withBorder p="xl" radius="md" >
            <Text ta="center" size="lg" w={500} mt="sm">
              {user.username}
            </Text>
            <Text ta="center" size="sm" color="dimmed">
              {user.role}
            </Text>
            {user.oauth && (
              <Text ta="center" size="sm" color="dimmed">
                Managed via SSO
              </Text>
            )}
            <Text ta="center" size="sm" color="dimmed">
              {new Date(user.createdAt).toLocaleDateString()}
            </Text>

            <Divider my="xl" />

            <div>
              <Switch
                checked={useNewChatPlayer}
                onChange={(event) =>
                  setUseNewChatPlayer(event.currentTarget.checked)
                }
                label="Use new chat player"
                description="Disable to use the standard rendered video chat playback."
                mb={10}
              />
              <Switch
                checked={showMoreUIDetails}
                onChange={(event) =>
                  setShowMoreUIDetails(event.currentTarget.checked)
                }
                label="More UI details"
                description="Show more information in the UI."
              />
              <Button
                onClick={() => updateUserSettings()}
                fullWidth
                radius="md"
                mt="md"
                size="md"
                color="violet"
              >
                Save
              </Button>
            </div>

            <Divider my="xl" />

            {!user.oauth && (
              <Button
                onClick={() => setOpened(true)}
                fullWidth
                radius="md"
                mt="xl"
                size="md"
                color="blue"
              >
                Change Password
              </Button>
            )}
            <Button
              onClick={() => logout()}
              fullWidth
              radius="md"
              mt="xs"
              size="md"
              color="red"
            >
              Logout
            </Button>
          </Card>
        </Center>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Change Password"
        >
          <div>
            <form onSubmit={submitPasswordChange}>
              <PasswordInput
                value={oldPassword}
                onChange={setOldPassword}
                placeholder="Password"
                label="Old Password"
                autoComplete="current-password"
                required
              />
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Password"
                label="New Password"
                description="Minimum of 8 characters."
                autoComplete="new-password"
                required
              />
              <PasswordInput
                value={passwordConfirm}
                onChange={setPasswordConfirm}
                placeholder="Password"
                label="Repeat New Password"
                autoComplete="new-password"
                required
              />
              <Button
                type="submit"
                fullWidth
                mt="lg"
                radius="md"
                size="md"
                color="green"
                loading={passwordChangeLoading}
              >
                Submit
              </Button>
            </form>
          </div>
        </Modal>
      </div>
    </Authorization>
  );
};

export default ProfilePage;
