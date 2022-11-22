import {
  Container,
  createStyles,
  Text,
  Button,
  Drawer,
  Title,
  Switch,
  TextInput,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from "../../hooks/useApi";

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  right: {
    marginLeft: "auto",
    order: 2,
  },
  settingsSections: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderRadius: theme.radius.md,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
    boxShadow: theme.shadows.sm,
  },
  link: {
    color: theme.colors.blue[6],
  },
}));

const AdminSettingsPage = () => {
  const { classes, cx, theme } = useStyles();
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [postVideoFFmpegArgs, setPostVideoFFmpegArgs] = useState("");
  const [streamlinkLiveArgs, setStreamlinkLiveArgs] = useState("");
  const [chatRenderArgs, setChatRenderArgs] = useState("");
  const [loading, setLoading] = useState(false);

  useDocumentTitle("Ganymede - Admin - Settings");

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/config", withCredentials: true },
        false
      ).then((res) => {
        setRegistrationEnabled(res?.data.registration_enabled);
        setWebhookUrl(res?.data.webhook_url);
        setPostVideoFFmpegArgs(res?.data.parameters.video_convert);
        setStreamlinkLiveArgs(res?.data.parameters.streamlink_live);
        setChatRenderArgs(res?.data.parameters.chat_render);
        return res?.data;
      }),
  });

  const saveSettings = useMutation({
    mutationKey: ["save-settings"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "PUT",
          url: `/api/v1/config`,
          data: {
            registration_enabled: registrationEnabled,
            webhook_url: webhookUrl,
            parameters: {
              video_convert: postVideoFFmpegArgs,
              streamlink_live: streamlinkLiveArgs,
              chat_render: chatRenderArgs,
            },
          },
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["save-settings"]);
          setLoading(false);
          showNotification({
            title: "Settings Updated",
            message: "Settings have been updated successfully",
          });
        })
        .catch((err) => {
          setLoading(false);
        });
    },
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container className={classes.settingsSections} size="md">
          <div className={classes.header}>
            <div>
              <Title order={2}>Settings</Title>
              <Text>
                Visit the{" "}
                <a
                  className={classes.link}
                  href="https://github.com/Zibbp/ganymede/wiki/Application-Settings"
                  target="_blank"
                >
                  wiki
                </a>{" "}
                for documentation regarding each setting.
              </Text>
            </div>
          </div>
          <div>
            <div>
              <Title order={3}>Core</Title>
              <Switch
                checked={registrationEnabled}
                onChange={(event) =>
                  setRegistrationEnabled(event.currentTarget.checked)
                }
                label="Registration Enabled"
              />
              <TextInput
                mt={10}
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.currentTarget.value)}
                placeholder="https://webhook.com/123"
                description="Webhook URL for notifications"
                label="Webhook URL"
              />
            </div>
            <div>
              <Title mt={15} order={3}>
                Video
              </Title>

              <TextInput
                value={postVideoFFmpegArgs}
                onChange={(event) =>
                  setPostVideoFFmpegArgs(event.currentTarget.value)
                }
                placeholder="-c:v copy -c:a copy"
                label="Video Convert FFmpeg Args"
                description="Post video download ffmpeg args."
              />
              <TextInput
                mt={5}
                value={streamlinkLiveArgs}
                onChange={(event) =>
                  setStreamlinkLiveArgs(event.currentTarget.value)
                }
                placeholder="--force-progress,--force,--twitch-low-latency,--twitch-disable-hosting"
                label="Streamlink Args"
                description="Streamlink arguments for live streams. Must be comma separated."
              />
            </div>
            <div>
              <Title mt={15} order={3}>
                Chat
              </Title>

              <TextInput
                value={chatRenderArgs}
                onChange={(event) =>
                  setChatRenderArgs(event.currentTarget.value)
                }
                placeholder="-h 1440 -w 340 --framerate 30 --font Inter --font-size 13 --badge-filter 96"
                label="Chat Render Args"
                description="TwitchDownloader chat render args."
              />
            </div>
            <Button
              onClick={() => saveSettings.mutate()}
              loading={loading}
              fullWidth
              radius="md"
              mt="md"
              size="md"
              color="violet"
            >
              Save
            </Button>
          </div>
        </Container>
      </div>
    </Authorization>
  );
};

export default AdminSettingsPage;
