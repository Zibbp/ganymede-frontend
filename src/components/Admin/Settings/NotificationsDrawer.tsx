import {
  ActionIcon,
  Button,
  Code,
  Collapse,
  createStyles,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";
import GanymedeLoader from "../../Utils/GanymedeLoader";

const useStyles = createStyles((theme) => ({
  notificationRow: {
    display: "flex",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  notificationRight: {
    marginTop: "0.5rem",
    marginLeft: "auto",
    order: 2,
  },
  link: {
    color: theme.colors.blue[6],
  },
}));

const AdminNotificationsDrawer = ({ handleClose }) => {
  const { classes, cx, theme } = useStyles();

  const { handleSubmit } = useForm();

  const [videoSuccessWebhookUrl, setVideoSuccessWebhookUrl] = useState("");
  const [videoSuccessTemplate, setVideoSuccessTemplate] = useState("");
  const [videoSuccessEnabled, setVideoSuccessEnabled] = useState(true);
  const [videoSuccessCollapse, setVideoSuccessCollapse] = useState(false);
  const [liveSuccessWebhookUrl, setLiveSuccessWebhookUrl] = useState("");
  const [liveSuccessTemplate, setLiveSuccessTemplate] = useState("");
  const [liveSuccessEnabled, setLiveSuccessEnabled] = useState(true);
  const [liveSuccessCollapse, setLiveSuccessCollapse] = useState(false);
  const [errorWebhookUrl, setErrorWebhookUrl] = useState("");
  const [errorTemplate, setErrorTemplate] = useState("");
  const [errorEnabled, setErrorEnabled] = useState(true);
  const [errorCollapse, setErrorCollapse] = useState(false);
  const [isLiveWebhookUrl, setIsLiveWebhookUrl] = useState("");
  const [isLiveTemplate, setIsLiveTemplate] = useState("");
  const [isLiveEnabled, setIsLiveEnabled] = useState(true);
  const [isLiveCollapse, setIsLiveCollapse] = useState(false);

  const [loading, setLoading] = useState(false);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);

  const { data, error, isLoading } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ["admin-notifications"],
    queryFn: () => {
      return useApi(
        {
          method: "GET",
          url: "/api/v1/config/notification",
          withCredentials: true,
        },
        false
      ).then((res) => {
        setVideoSuccessWebhookUrl(res?.data.video_success_webhook_url);
        setVideoSuccessTemplate(res?.data.video_success_template);
        setVideoSuccessEnabled(res?.data.video_success_enabled);
        setLiveSuccessWebhookUrl(res?.data.live_success_webhook_url);
        setLiveSuccessTemplate(res?.data.live_success_template);
        setLiveSuccessEnabled(res?.data.live_success_enabled);
        setErrorWebhookUrl(res?.data.error_webhook_url);
        setErrorTemplate(res?.data.error_template);
        setErrorEnabled(res?.data.error_enabled);
        setIsLiveWebhookUrl(res?.data.is_live_webhook_url);
        setIsLiveTemplate(res?.data.is_live_template);
        setIsLiveEnabled(res?.data.is_live_enabled);
        return res?.data;
      });
    },
  });

  const { mutate, error: mutateError } = useMutation({
    mutationKey: ["save-notification-settings"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "PUT",
          url: "/api/v1/config/notification",
          data: {
            video_success_webhook_url: videoSuccessWebhookUrl,
            video_success_template: videoSuccessTemplate,
            video_success_enabled: videoSuccessEnabled,
            live_success_webhook_url: liveSuccessWebhookUrl,
            live_success_template: liveSuccessTemplate,
            live_success_enabled: liveSuccessEnabled,
            error_webhook_url: errorWebhookUrl,
            error_template: errorTemplate,
            error_enabled: errorEnabled,
            is_live_webhook_url: isLiveWebhookUrl,
            is_live_template: isLiveTemplate,
            is_live_enabled: isLiveEnabled,
          },
          withCredentials: true,
        },
        false
      )
        .then((res) => {
          setLoading(false);
          return res?.data;
        })
        .catch((err) => {
          setLoading(false);
          return err;
        });
    },
  });

  const { mutate: testNotification } = useMutation({
    mutationKey: ["test-notification"],
    mutationFn: (type: string) => {
      setTestNotificationLoading(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/notification/test?type=${type}`,
          withCredentials: true,
        },
        false
      )
        .then((res) => {
          setTestNotificationLoading(false);
          return res?.data;
        })
        .catch((err) => {
          setTestNotificationLoading(false);
          return err;
        });
    },
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      <Text mb={10}>
        Must be a webhook url or an
        <a
          className={classes.link}
          href="https://github.com/caronc/apprise-api"
          target="_blank"
        >
          {" "}
          Apprise{" "}
        </a>
        url, visit the{" "}
        <a
          className={classes.link}
          href="https://github.com/Zibbp/ganymede/wiki/Notifications"
          target="_blank"
        >
          {" "}
          wiki{" "}
        </a>
        for more information.
      </Text>
      <form onSubmit={handleSubmit(mutate)}>
        <div>
          <Title order={4} mb={-10}>
            Video Archive Success Notification
          </Title>
          <div className={classes.notificationRow}>
            <Switch
              mb={5}
              checked={videoSuccessEnabled}
              onChange={(event) =>
                setVideoSuccessEnabled(event.currentTarget.checked)
              }
              label="Enabled"
            />
            <div className={classes.notificationRight}>
              <Button
                onClick={() => testNotification("video_success")}
                variant="outline"
                color="violet"
                loading={testNotificationLoading}
              >
                Test
              </Button>
            </div>
          </div>
          <TextInput
            value={videoSuccessWebhookUrl}
            onChange={(e) => setVideoSuccessWebhookUrl(e.currentTarget.value)}
            placeholder="https://webhook.curl"
            label="Webhook URL"
            mb="xs"
          />
          <Textarea
            label="Template"
            value={videoSuccessTemplate}
            onChange={(event) =>
              setVideoSuccessTemplate(event.currentTarget.value)
            }
          />
          <Button
            mt={5}
            onClick={() => setVideoSuccessCollapse((o) => !o)}
            leftIcon={
              videoSuccessCollapse ? (
                <IconChevronUp size={18} />
              ) : (
                <IconChevronDown size={18} />
              )
            }
            variant="subtle"
            color="gray"
            size="xs"
            compact
          >
            Available variables
          </Button>

          <Collapse in={videoSuccessCollapse}>
            <div>
              <Text>Channel</Text>
              <Code>
                {"{{channel_id}} {{channel_ext_id}} {{channel_display_name}}"}
              </Code>
              <Text>Video</Text>
              <Code>
                {
                  "{{vod_id}} {{vod_ext_id}} {{vod_platform}} {{vod_type}} {{vod_title}} {{vod_duration}} {{vod_views}} {{vod_resolution}} {{vod_streamed_at}} {{vod_created_at}}"
                }
              </Code>
              <Text>Queue</Text>
              <Code>{"{{queue_id}} {{queue_created_at}}"}</Code>
            </div>
          </Collapse>
        </div>
        {/* Live Success */}
        <div>
          <Title order={4} mb={-10}>
            Live Achive Success Notification
          </Title>
          <div className={classes.notificationRow}>
            <Switch
              mb={5}
              checked={liveSuccessEnabled}
              onChange={(event) =>
                setLiveSuccessEnabled(event.currentTarget.checked)
              }
              label="Enabled"
            />
            <div className={classes.notificationRight}>
              <Button
                onClick={() => testNotification("live_success")}
                variant="outline"
                color="violet"
                loading={testNotificationLoading}
              >
                Test
              </Button>
            </div>
          </div>
          <TextInput
            value={liveSuccessWebhookUrl}
            onChange={(e) => setLiveSuccessWebhookUrl(e.currentTarget.value)}
            placeholder="https://webhook.curl"
            label="Webhook URL"
            mb="xs"
          />
          <Textarea
            label="Template"
            value={liveSuccessTemplate}
            onChange={(event) =>
              setLiveSuccessTemplate(event.currentTarget.value)
            }
          />
          <Button
            mt={5}
            onClick={() => setLiveSuccessCollapse((o) => !o)}
            leftIcon={
              liveSuccessCollapse ? (
                <IconChevronUp size={18} />
              ) : (
                <IconChevronDown size={18} />
              )
            }
            variant="subtle"
            color="gray"
            size="xs"
            compact
          >
            Available variables
          </Button>

          <Collapse in={liveSuccessCollapse}>
            <div>
              <Text>Channel</Text>
              <Code>
                {"{{channel_id}} {{channel_ext_id}} {{channel_display_name}}"}
              </Code>
              <Text>Video</Text>
              <Code>
                {
                  "{{vod_id}} {{vod_ext_id}} {{vod_platform}} {{vod_type}} {{vod_title}} {{vod_duration}} {{vod_views}} {{vod_resolution}} {{vod_streamed_at}} {{vod_created_at}}"
                }
              </Code>
              <Text>Queue</Text>
              <Code>{"{{queue_id}} {{queue_created_at}}"}</Code>
            </div>
          </Collapse>
        </div>
        {/* Is Live */}
        <div>
          <Title order={4} mb={-10}>
            Is Live Notification
          </Title>
          <div className={classes.notificationRow}>
            <Switch
              mb={5}
              checked={isLiveEnabled}
              onChange={(event) =>
                setIsLiveCollapse(event.currentTarget.checked)
              }
              label="Enabled"
            />
            <div className={classes.notificationRight}>
              <Button
                onClick={() => testNotification("is_live")}
                variant="outline"
                color="violet"
                loading={testNotificationLoading}
              >
                Test
              </Button>
            </div>
          </div>
          <TextInput
            value={isLiveWebhookUrl}
            onChange={(e) => setIsLiveWebhookUrl(e.currentTarget.value)}
            placeholder="https://webhook.curl"
            label="Webhook URL"
            mb="xs"
          />
          <Textarea
            label="Template"
            value={isLiveTemplate}
            onChange={(event) => setIsLiveTemplate(event.currentTarget.value)}
          />
          <Button
            mt={5}
            onClick={() => setIsLiveCollapse((o) => !o)}
            leftIcon={
              isLiveCollapse ? (
                <IconChevronUp size={18} />
              ) : (
                <IconChevronDown size={18} />
              )
            }
            variant="subtle"
            color="gray"
            size="xs"
            compact
          >
            Available variables
          </Button>

          <Collapse in={isLiveCollapse}>
            <div>
              <Text>Channel</Text>
              <Code>
                {"{{channel_id}} {{channel_ext_id}} {{channel_display_name}}"}
              </Code>
              <Text>Video</Text>
              <Code>
                {
                  "{{vod_id}} {{vod_ext_id}} {{vod_platform}} {{vod_type}} {{vod_title}} {{vod_duration}} {{vod_views}} {{vod_resolution}} {{vod_streamed_at}} {{vod_created_at}}"
                }
              </Code>
              <Text>Queue</Text>
              <Code>{"{{queue_id}} {{queue_created_at}}"}</Code>
            </div>
          </Collapse>
        </div>
        {/* Error */}
        <div>
          <Title mt={10} order={4} mb={-10}>
            Error Notification
          </Title>
          <Text mt={3} size="xs">
            In certain circumstances your template may be overriden.
          </Text>
          <div className={classes.notificationRow}>
            <Switch
              mb={5}
              checked={errorEnabled}
              onChange={(event) => setErrorEnabled(event.currentTarget.checked)}
              label="Enabled"
            />
            <div className={classes.notificationRight}>
              <Button
                onClick={() => testNotification("error")}
                variant="outline"
                color="violet"
                loading={testNotificationLoading}
              >
                Test
              </Button>
            </div>
          </div>
          <TextInput
            value={errorWebhookUrl}
            onChange={(e) => setErrorWebhookUrl(e.currentTarget.value)}
            placeholder="https://webhook.curl"
            label="Webhook URL"
            mb="xs"
          />
          <Textarea
            label="Template"
            value={errorTemplate}
            onChange={(event) => setErrorTemplate(event.currentTarget.value)}
          />
          <Button
            mt={5}
            onClick={() => setErrorCollapse((o) => !o)}
            leftIcon={
              errorCollapse ? (
                <IconChevronUp size={18} />
              ) : (
                <IconChevronDown size={18} />
              )
            }
            variant="subtle"
            color="gray"
            size="xs"
            compact
          >
            Available variables
          </Button>

          <Collapse in={errorCollapse}>
            <div>
              <Text>Task</Text>
              <Code>{"{{failed_task}}"}</Code>
              <Text>Channel</Text>
              <Code>
                {"{{channel_id}} {{channel_ext_id}} {{channel_display_name}}"}
              </Code>
              <Text>Video</Text>
              <Code>
                {
                  "{{vod_id}} {{vod_ext_id}} {{vod_platform}} {{vod_type}} {{vod_title}} {{vod_duration}} {{vod_views}} {{vod_resolution}} {{vod_streamed_at}} {{vod_created_at}}"
                }
              </Code>
              <Text>Queue</Text>
              <Code>{"{{queue_id}} {{queue_created_at}}"}</Code>
            </div>
          </Collapse>
        </div>

        <Button
          mt={10}
          type="submit"
          fullWidth
          radius="md"
          size="md"
          color="violet"
          loading={loading}
        >
          Save
        </Button>
      </form>
    </div>
  );
};

export default AdminNotificationsDrawer;
