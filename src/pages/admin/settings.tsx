import {
  Container,
  Text,
  Button,
  Drawer,
  Title,
  Switch,
  TextInput,
  Group,
  ActionIcon,
  MultiSelect,
  Card,
  Collapse,
  Code,
  Textarea,
} from "@mantine/core";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import AdminNotificationsDrawer from "../../components/Admin/Settings/NotificationsDrawer";
import AdminStorageSettingsDrawer from "../../components/Admin/Settings/StorageSettingsDrawer";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from "../../hooks/useApi";
import { Config, ProxyItem } from "../../ganymede-defs";
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash } from "@tabler/icons-react";
import classes from "./settings.module.css"
import Link from "next/link";
import { S } from "@vidstack/react/types/vidstack-framework";

const AdminSettingsPage = () => {
  const [config, setConfig] = useState<Config>({} as Config);
  const [channelData, setChannelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // notifications
  const [notificationSettingsOpened, { toggle: toggleNotificationSettings }] = useDisclosure(false)
  const [videoSuccessCollapse, setVideoSuccessCollapse] = useState(false);
  const [liveSuccessCollapse, setLiveSuccessCollapse] = useState(false);
  const [errorCollapse, setErrorCollapse] = useState(false);
  const [isLiveCollapse, setIsLiveCollapse] = useState(false);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);

  // storage settings
  const [storageSettingsOpened, { toggle: toggleStorageSettings }] = useDisclosure(false)
  const folderExample1 = "{{id}}-{{uuid}}";
  const folderExample2 = "{{date}}-{{title}}-{{type}}-{{id}}-{{uuid}}";
  const fileExample1 = "{{id}}";


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

  useDocumentTitle("Ganymede - Admin - Settings");

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/config", withCredentials: true },
        false
      ).then((res) => {
        setConfig(res?.data);
        return res?.data;
      }),
  });

  // Fetch channels
  const { data: channels } = useQuery({
    queryKey: ["admin-channels"],
    queryFn: () => {
      return useApi(
        {
          method: "GET",
          url: `/api/v1/channel`,
          withCredentials: true,
        },
        false
      ).then((res) => {
        const tmpArr = [];
        res?.data.forEach((channel) => {
          tmpArr.push({
            label: channel.name,
            value: channel.name,
          });
        });
        setChannelData(tmpArr);
        return res?.data;
      });
    },
  });

  // useEffect(() => {
  //   // a
  // }, [channelData]);

  const saveSettings = useMutation({
    mutationKey: ["save-settings"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "PUT",
          url: `/api/v1/config`,
          data: {
            ...config,
          },
          withCredentials: true,
        },
        false
      )
        .then(() => {
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

  const openDrawer = () => {
    setDrawerOpened(true);
  };

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  const openStorageTemplateDrawer = () => {
    setStorageTemplateDrawerOpened(true);
  };

  const closeStorageTemplateDrawerCallback = () => {
    setStorageTemplateDrawerOpened(false);
  };

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <Container>
        <div>
          <Card withBorder p="xl" radius="md" className={classes.settingsSections} >
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
                  mt={5}
                  checked={config.registration_enabled}
                  onChange={(event) =>
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      registration_enabled: event.currentTarget.checked
                    }))
                  }
                  label="Registration Enabled"
                />

                <Button
                  mt={15}
                  onClick={toggleNotificationSettings}
                  fullWidth
                  radius="md"
                  size="md"
                  variant="outline"
                  color="orange"
                >
                  Notification Settings
                </Button>


                <Collapse in={notificationSettingsOpened}>
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

                    <div>
                      <Title order={4} mb={-10}>
                        Video Archive Success Notification
                      </Title>
                      <div className={classes.notificationRow}>
                        <Group mt={10}>
                          <Switch
                            checked={config.notifications.video_success_enabled}
                            onChange={(event) =>
                              setConfig(prevConfig => ({
                                ...prevConfig,
                                notifications: {
                                  ...prevConfig.notifications,
                                  video_success_enabled: event.currentTarget.checked,
                                },
                              }))
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
                        </Group>
                      </div>
                      <TextInput
                        value={config.notifications.video_success_webhook_url}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            notifications: {
                              ...prevConfig.notifications,
                              video_success_webhook_url: event.currentTarget.value
                            }
                          }))
                        }
                        placeholder="https://webhook.curl"
                        label="Webhook URL"
                        mb="xs"
                      />
                      <Textarea
                        label="Template"
                        value={config.notifications.video_success_template}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            notifications: {
                              ...prevConfig.notifications,
                              video_success_template: event.currentTarget.value
                            }
                          }))
                        }
                      />
                      <Button
                        mt={5}
                        onClick={() => setVideoSuccessCollapse((o) => !o)}
                        leftSection={
                          videoSuccessCollapse ? (
                            <IconChevronUp size={18} />
                          ) : (
                            <IconChevronDown size={18} />
                          )
                        }
                        variant="subtle"
                        color="gray"
                        size="xs"
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
                        <Group mt={10}>
                          <Switch
                            checked={config.notifications.live_success_enabled}
                            onChange={(event) =>
                              setConfig(prevConfig => ({
                                ...prevConfig,
                                notifications: {
                                  ...prevConfig.notifications,
                                  live_success_enabled: event.currentTarget.checked,
                                },
                              }))
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
                        </Group>
                      </div>
                      <TextInput
                        value={config.notifications.live_success_webhook_url}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            notifications: {
                              ...prevConfig.notifications,
                              live_success_webhook_url: event.currentTarget.value
                            }
                          }))
                        }
                        placeholder="https://webhook.curl"
                        label="Webhook URL"
                        mb="xs"
                      />
                      <Textarea
                        label="Template"
                        value={config.notifications.live_success_template}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            notifications: {
                              ...prevConfig.notifications,
                              live_success_template: event.currentTarget.value
                            }
                          }))
                        }
                      />
                      <Button
                        mt={5}
                        onClick={() => setLiveSuccessCollapse((o) => !o)}
                        leftSection={
                          liveSuccessCollapse ? (
                            <IconChevronUp size={18} />
                          ) : (
                            <IconChevronDown size={18} />
                          )
                        }
                        variant="subtle"
                        color="gray"
                        size="xs"
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
                        <Group mt={10}>
                          <Switch
                            checked={config.notifications.is_live_enabled}
                            onChange={(event) =>
                              setConfig(prevConfig => ({
                                ...prevConfig,
                                notifications: {
                                  ...prevConfig.notifications,
                                  is_live_enabled: event.currentTarget.checked,
                                },
                              }))
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
                        </Group>
                      </div>
                      <TextInput
                        value={config.notifications.is_live_webhook_url}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            notifications: {
                              ...prevConfig.notifications,
                              is_live_webhook_url: event.currentTarget.value
                            }
                          }))
                        }
                        placeholder="https://webhook.curl"
                        label="Webhook URL"
                        mb="xs"
                      />
                      <Textarea
                        label="Template"
                        value={config.notifications.is_live_template}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            notifications: {
                              ...prevConfig.notifications,
                              is_live_template: event.currentTarget.value
                            }
                          }))
                        }
                      />
                      <Button
                        mt={5}
                        onClick={() => setIsLiveCollapse((o) => !o)}
                        leftSection={
                          isLiveCollapse ? (
                            <IconChevronUp size={18} />
                          ) : (
                            <IconChevronDown size={18} />
                          )
                        }
                        variant="subtle"
                        color="gray"
                        size="xs"
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
                        <Group mt={10}>
                          <Switch
                            checked={config.notifications.error_enabled}
                            onChange={(event) =>
                              setConfig(prevConfig => ({
                                ...prevConfig,
                                notifications: {
                                  ...prevConfig.notifications,
                                  error_enabled: event.currentTarget.checked
                                }
                              }))
                            }
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
                        </Group>
                      </div>
                      <TextInput
                        value={config.notifications.error_webhook_url}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            notifications: {
                              ...prevConfig.notifications,
                              error_webhook_url: event.currentTarget.value
                            }
                          }))
                        }
                        placeholder="https://webhook.curl"
                        label="Webhook URL"
                        mb="xs"
                      />
                      <Textarea
                        label="Template"
                        value={config.notifications.error_template}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            notifications: {
                              ...prevConfig.notifications,
                              error_template: event.currentTarget.value
                            }
                          }))
                        }
                      />
                      <Button
                        mt={5}
                        onClick={() => setErrorCollapse((o) => !o)}
                        leftSection={
                          errorCollapse ? (
                            <IconChevronUp size={18} />
                          ) : (
                            <IconChevronDown size={18} />
                          )
                        }
                        variant="subtle"
                        color="gray"
                        size="xs"
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
                  </div>
                </Collapse>


              </div>
              <div>
                <Title mt={15} order={3}>
                  Archive
                </Title>
                <Text size="sm">Convert the archived mp4 to a HLS playlist.</Text>
                <Switch
                  mt={5}
                  checked={config.archive.save_as_hls}
                  onChange={(event) =>
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      archive: {
                        ...prevConfig.archive,
                        save_as_hls: event.currentTarget.checked
                      }
                    }))
                  }
                  label="Convert to HLS"
                />
                <Button
                  mt={15}
                  onClick={toggleStorageSettings}
                  fullWidth
                  radius="md"
                  size="md"
                  variant="outline"
                  color="orange"
                >
                  Storage Template Settings
                </Button>

                <Collapse in={storageSettingsOpened}>
                  <div>
                    <Text mb={10}>
                      Customize how folders and files are named. This only applies to new
                      files. To apply to existing files execute the migration task on the{" "}
                      <Link className={classes.link} href="/admin/tasks">
                        tasks
                      </Link>{" "}
                      page.
                    </Text>
                    <div>
                      <Title order={4}>Folder Template</Title>

                      <Textarea
                        description="{{uuid}} is required to be present for the folder template."
                        value={config.storage_templates.folder_template}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            storage_templates: {
                              ...prevConfig.storage_templates,
                              folder_template: event.currentTarget.value
                            }
                          }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <Title mt={5} order={4}>
                        File Template
                      </Title>

                      <Textarea
                        description="Do not include the file extension. The file type will be appened to the end of the file name such as -video -chat and -thumbnail."
                        value={config.storage_templates.file_template}
                        onChange={(event) =>
                          setConfig(prevConfig => ({
                            ...prevConfig,
                            storage_templates: {
                              ...prevConfig.storage_templates,
                              file_template: event.currentTarget.value
                            }
                          }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <Title mt={5} order={4}>
                        Available Variables
                      </Title>

                      <div>
                        <Text>Ganymede</Text>
                        <Code>{"{{uuid}}"}</Code>
                        <Text>Twitch Video</Text>
                        <Code>{"{{id}} {{channel}} {{title}} {{date}} {{type}}"}</Code>
                        <Text ml={20} mt={5} size="sm">
                          ID: Twitch video ID <br /> Date: Date streamed or uploaded <br />{" "}
                          Type: Twitch video type (live, archive, highlight)
                        </Text>
                      </div>
                    </div>

                    <div>
                      <Title mt={5} order={4}>
                        Examples
                      </Title>

                      <Text>Folder</Text>
                      <Code block>{folderExample1}</Code>
                      <Code block>{folderExample2}</Code>
                      <Text>File</Text>
                      <Code block>{fileExample1}</Code>
                    </div>


                  </div>
                </Collapse>

              </div>
              <div>
                <Title mt={15} order={3}>
                  Video
                </Title>

                <TextInput
                  mt={5}
                  value={config.parameters.twitch_token}
                  onChange={(event) =>
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      parameters: {
                        ...prevConfig.parameters,
                        twitch_token: event.currentTarget.value
                      }
                    }))
                  }
                  placeholder="abcdefg1234567890"
                  label="Twitch Token"
                  description="Supply your Twitch token for downloading ad-free livestreams and subscriber only videos."
                />
                <TextInput
                  mt={5}
                  value={config.parameters.video_convert}
                  onChange={(event) =>
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      parameters: {
                        ...prevConfig.parameters,
                        video_convert: event.currentTarget.value
                      }
                    }))
                  }
                  placeholder="-c:v copy -c:a copy"
                  label="Video Convert FFmpeg Args"
                  description="Post video download ffmpeg args."
                />
              </div>
              <div>
                <Title mt={15} order={3}>
                  Livestream
                </Title>
                <TextInput
                  mt={5}
                  value={config.parameters.streamlink_live}
                  onChange={(event) =>
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      parameters: {
                        ...prevConfig.parameters,
                        streamlink_live: event.currentTarget.value
                      }
                    }))
                  }
                  placeholder="--force-progress,--force,--twitch-low-latency,--twitch-disable-hosting"
                  label="Streamlink Parameters"
                  description="For live streams. Must be comma separated."
                />

                <Text mt={5} mb={5}>
                  Proxies
                </Text>
                <Text size="sm">
                  Archive livestreams through a proxy to prevent ads. Your Twitch
                  token will <b>not</b> be sent to the proxy.
                </Text>
                <Switch
                  label="Enable proxy"
                  color="violet"
                  checked={config.livestream.proxy_enabled}
                  onChange={(event) =>
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      livestream: {
                        ...prevConfig.livestream,
                        proxy_enabled: event.currentTarget.checked
                      }
                    }))
                  }
                />
                {config.livestream.proxies.map((proxy, index) => (
                  <div key={index} className={classes.proxyList}>
                    <TextInput
                      className={classes.proxyInput}
                      placeholder="https://proxy.url"
                      value={proxy.url}
                      onChange={(event) => {
                        setConfig(prevConfig => ({
                          ...prevConfig,
                          livestream: {
                            ...prevConfig.livestream,
                            proxies: prevConfig.livestream.proxies.map((p, i) =>
                              i === index ? { ...p, url: event.currentTarget.value } : p
                            )
                          }
                        }));
                      }}
                      label="Proxy URL"
                    />
                    <TextInput
                      className={classes.proxyInput}
                      value={proxy.header}
                      onChange={(event) => {
                        setConfig(prevConfig => ({
                          ...prevConfig,
                          livestream: {
                            ...prevConfig.livestream,
                            proxies: prevConfig.livestream.proxies.map((proxy, i) =>
                              i === index ? { ...proxy, header: event.currentTarget.value } : proxy
                            )
                          }
                        }));
                      }}
                      label="Header"
                    />
                    <ActionIcon
                      color="red"
                      size="lg"
                      mt={20}
                      onClick={() => {
                        setConfig(prevConfig => ({
                          ...prevConfig,
                          livestream: {
                            ...prevConfig.livestream,
                            proxies: prevConfig.livestream.proxies.filter((_, i) => i !== index)
                          }
                        }));
                      }}
                    >
                      <IconTrash size="1.125rem" />
                    </ActionIcon>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      livestream: {
                        ...prevConfig.livestream,
                        proxies: [
                          ...prevConfig.livestream.proxies,
                          {
                            url: "",
                            header: ""
                          }
                        ]
                      }
                    }));
                  }}
                  mt={10}
                  leftSection={<IconPlus size="1rem" />}
                  color="violet"
                >
                  Add
                </Button>
                {/* proxy whitelist */}
                <MultiSelect
                  data={channelData}
                  value={config.livestream.proxy_whitelist}
                  onChange={(value) => {
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      livestream: {
                        ...prevConfig.livestream,
                        proxy_whitelist: value
                      }
                    }));
                  }} label="Whitelist Channels"
                  description="These channels will not use the proxy if enabled, instead your Twitch token will be used. Select channels that you are subscribed to."
                  placeholder="Select channels"
                />
              </div>
              <div>
                <Title mt={15} order={3}>
                  Chat
                </Title>

                <TextInput
                  value={config.parameters.chat_render}
                  onChange={(event) =>
                    setConfig(prevConfig => ({
                      ...prevConfig,
                      parameters: {
                        ...prevConfig.parameters,
                        chat_render: event.currentTarget.value
                      }
                    }))
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
          </Card>
        </div>
      </Container>
    </Authorization>
  );
};

export default AdminSettingsPage;
