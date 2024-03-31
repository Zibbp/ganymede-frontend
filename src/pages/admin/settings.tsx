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
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import AdminNotificationsDrawer from "../../components/Admin/Settings/NotificationsDrawer";
import AdminStorageSettingsDrawer from "../../components/Admin/Settings/StorageSettingsDrawer";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from "../../hooks/useApi";
import { ProxyItem } from "../../ganymede-defs";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import classes from "./settings.module.css"

const AdminSettingsPage = () => {
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [postVideoFFmpegArgs, setPostVideoFFmpegArgs] = useState("");
  const [streamlinkLiveArgs, setStreamlinkLiveArgs] = useState("");
  const [chatRenderArgs, setChatRenderArgs] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [storageTemplateDrawerOpened, setStorageTemplateDrawerOpened] =
    useState(false);
  const [saveAsHls, setSaveAsHls] = useState(false);
  const [twitchToken, setTwitchToken] = useState("");
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyList, setProxyList] = useState<ProxyItem[]>([]);
  const [proxyWhitelist, setProxyWhitelist] = useState<string[]>([]);
  const [channelData, setChannelData] = useState<any[]>([]);

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
        setPostVideoFFmpegArgs(res?.data.parameters.video_convert);
        setStreamlinkLiveArgs(res?.data.parameters.streamlink_live);
        setChatRenderArgs(res?.data.parameters.chat_render);
        setSaveAsHls(res?.data.archive.save_as_hls);
        setTwitchToken(res?.data.parameters.twitch_token);
        setProxyEnabled(res?.data.livestream.proxy_enabled);
        setProxyList(res?.data.livestream.proxies);
        setProxyWhitelist(res?.data.livestream.proxy_whitelist);
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
            registration_enabled: registrationEnabled,
            parameters: {
              video_convert: postVideoFFmpegArgs,
              streamlink_live: streamlinkLiveArgs,
              chat_render: chatRenderArgs,
              twitch_token: twitchToken,
            },
            archive: {
              save_as_hls: saveAsHls,
            },
            livestream: {
              proxy_enabled: proxyEnabled,
              proxies: proxyList,
              proxy_whitelist: proxyWhitelist,
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
                  checked={registrationEnabled}
                  onChange={(event) =>
                    setRegistrationEnabled(event.currentTarget.checked)
                  }
                  label="Registration Enabled"
                />

                <Button
                  mt={15}
                  onClick={() => openDrawer()}
                  fullWidth
                  radius="md"
                  size="md"
                  variant="outline"
                  color="orange"
                >
                  Notification Settings
                </Button>
              </div>
              <div>
                <Title mt={15} order={3}>
                  Archive
                </Title>
                <Text size="sm">Convert the archived mp4 to a HLS playlist.</Text>
                <Switch
                  mt={5}
                  checked={saveAsHls}
                  onChange={(event) => setSaveAsHls(event.currentTarget.checked)}
                  label="Convert to HLS"
                />
                <Button
                  mt={15}
                  onClick={() => openStorageTemplateDrawer()}
                  fullWidth
                  radius="md"
                  size="md"
                  variant="outline"
                  color="orange"
                >
                  Storage Template Settings
                </Button>
              </div>
              <div>
                <Title mt={15} order={3}>
                  Video
                </Title>

                <TextInput
                  mt={5}
                  value={twitchToken}
                  onChange={(event) => setTwitchToken(event.currentTarget.value)}
                  placeholder="abcdefg1234567890"
                  label="Twitch Token"
                  description="Supply your Twitch token for downloading ad-free livestreams and subscriber only videos."
                />
                <TextInput
                  mt={5}
                  value={postVideoFFmpegArgs}
                  onChange={(event) =>
                    setPostVideoFFmpegArgs(event.currentTarget.value)
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
                  value={streamlinkLiveArgs}
                  onChange={(event) =>
                    setStreamlinkLiveArgs(event.currentTarget.value)
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
                  checked={proxyEnabled}
                  onChange={(event) =>
                    setProxyEnabled(event.currentTarget.checked)
                  }
                />
                {proxyList.map((proxy, index) => (
                  <div key={index} className={classes.proxyList}>
                    <TextInput
                      className={classes.proxyInput}
                      placeholder="https://proxy.url"
                      value={proxy.url}
                      onChange={(event) => {
                        const newProxyList = [...proxyList];
                        newProxyList[index].url = event.currentTarget.value;
                        setProxyList(newProxyList);
                      }}
                      label="Proxy URL"
                    />
                    <TextInput
                      className={classes.proxyInput}
                      value={proxy.header}
                      onChange={(event) => {
                        const newProxyList = [...proxyList];
                        newProxyList[index].header = event.currentTarget.value;
                        setProxyList(newProxyList);
                      }}
                      label="Header"
                    />
                    <ActionIcon
                      color="red"
                      size="lg"
                      mt={20}
                      onClick={() => {
                        const newProxyList = [...proxyList];
                        newProxyList.splice(index, 1);
                        setProxyList(newProxyList);
                      }}
                    >
                      <IconTrash size="1.125rem" />
                    </ActionIcon>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const newProxyList = [...proxyList];
                    newProxyList.push({ url: "", header: "" });
                    setProxyList(newProxyList);
                  }}
                  mt={10}
                  leftIcon={<IconPlus size="1rem" />}
                  color="violet"
                >
                  Add
                </Button>
                {/* proxy whitelist */}
                <MultiSelect
                  data={channelData}
                  value={proxyWhitelist}
                  onChange={setProxyWhitelist}
                  label="Whitelist Channels"
                  description="These channels will not use the proxy if enabled, instead your Twitch token will be used. Select channels that you are subscribed to."
                  placeholder="Select channels"
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
          </Card>
        </div>
        <Drawer
          className={classes.notificationDrawer}
          opened={drawerOpened}
          onClose={() => setDrawerOpened(false)}
          title="Notification Settings"
          padding="xl"
          size="xl"
          position="right"
        >
          <AdminNotificationsDrawer handleClose={closeDrawerCallback} />
        </Drawer>
        <Drawer
          className={classes.notificationDrawer}
          opened={storageTemplateDrawerOpened}
          onClose={() => setStorageTemplateDrawerOpened(false)}
          title="Storage Template Settings"
          padding="xl"
          size="xl"
          position="right"
        >
          <AdminStorageSettingsDrawer
            handleClose={closeStorageTemplateDrawerCallback}
          />
        </Drawer>
      </Container>
    </Authorization>
  );
};

export default AdminSettingsPage;
