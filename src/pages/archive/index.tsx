import {
  Center,
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  Title,
  TextInput,
  Container,
  Select,
  Switch,
  Divider,
} from "@mantine/core";
import { useDocumentTitle, useInputState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { VodPreview } from "../../components/Archive/VodPreview";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import { useApi } from "../../hooks/useApi";
import classes from "./archive.module.css"

export interface TwitchVODResponse {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: Date;
  published_at: Date;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  muted_segments: null;
}

const ArchivePage = () => {
  const [archiveInput, setArchiveInput] = useInputState("");
  const [archiveSubmitLoading, setArchiveSubmitLoading] = useState(false);
  const [twitchVodInfo, setTwitchVodInfo] = useState<TwitchVODResponse | null>(
    null
  );
  const [archiveChat, setArchiveChat] = useInputState(true);
  const [renderChat, setRenderChat] = useInputState(true);
  const [archiveQuality, setArchiveQuality] = useInputState<string | null>(
    "best"
  );
  const [channelData, setChannelData] = useState([]);
  const [channelId, setChannelID] = useState("");
  useDocumentTitle("Archive - Ganymede");

  const qualityOptions = [
    { label: "Best", value: "best" },
    { label: "720p60", value: "720p60" },
    { label: "480p", value: "480p30" },
    { label: "360p", value: "360p30" },
    { label: "160p", value: "160p30" },
    { label: "audio", value: "audio" }
  ];

  const archiveVodSubmit = useMutation({
    mutationKey: ["archive-vod"],
    mutationFn: () => {
      if (!archiveInput && !channelId) {
        return;
      }
      if (archiveInput && channelId) {
        showNotification({
          title: "Select one",
          message: "Please either enter an ID or select a channel (not both)",
        });
        return;
      }
      setArchiveSubmitLoading(true);
      if (archiveInput != "") {
        return useApi(
          {
            method: "POST",
            url: `/api/v1/archive/vod`,
            data: {
              vod_id: archiveInput,
              quality: archiveQuality,
              chat: archiveChat,
              render_chat: renderChat,
            },
            withCredentials: true,
          },
          false
        )
          .then((res) => {
            setArchiveSubmitLoading(false);
            setTwitchVodInfo(null);
            setArchiveInput("");
            showNotification({
              title: "VOD Archived",
              message: "VOD has been added to the archive queue",
            });
          })
          .catch((err) => {
            setArchiveSubmitLoading(false);
          });
      }
      if (channelId != "") {
        return useApi(
          {
            method: "POST",
            url: `/api/v1/live/archive`,
            data: {
              channel_id: channelId,
              resolution: archiveQuality,
              archive_chat: archiveChat,
              render_chat: renderChat,
            },
            withCredentials: true,
          },
          false
        )
          .then((res) => {
            setArchiveSubmitLoading(false);
            setTwitchVodInfo(null);
            setArchiveInput("");
            showNotification({
              title: "Livestream Archived",
              message: "Livestream has been added to the archive queue",
            });
          })
          .catch((err) => {
            setArchiveSubmitLoading(false);
          });
      }
    },
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
        res.data.forEach((channel) => {
          tmpArr.push({
            label: channel.name,
            value: channel.id,
          });
        });
        setChannelData(tmpArr);
        return res?.data;
      });
    },
  });

  const getVodInfo = useMutation({
    mutationKey: ["twitch-vod"],
    mutationFn: (id: string) => {
      // Get ID from the url
      if (id.includes("twitch.tv/videos/")) {
        id = id.split("twitch.tv/videos/")[1];
        // Remove any query params
        if (id.includes("?")) {
          id = id.split("?")[0];
        }
      }
      setArchiveInput(id);
      if (id == "") {
        setTwitchVodInfo(null);
        return;
      }
      if (id.length < 4) return;

      return useApi(
        { method: "GET", url: `/api/v1/twitch/vod?id=${id}` },
        false
      )
        .then((res) => {
          setTwitchVodInfo(res?.data);
        })
        .catch((err) => {
          setTwitchVodInfo(null);
        });
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container size="md" mt={20}>
          <Center>
            <div style={{ width: "100%" }}>
              <Card
                className={classes.card}
                shadow="sm"
                p="lg"
                radius="md"
                withBorder
              >
                <Center>
                  <div>
                    <Title>Archive</Title>
                  </div>
                </Center>
                <Center mb={10}>
                  <Text>
                    Enter a video ID or select a channel to archive a livestream
                  </Text>
                </Center>
                <TextInput
                  value={archiveInput}
                  onChange={(e) => getVodInfo.mutate(e.currentTarget.value)}
                  placeholder="Video ID or URL"
                  withAsterisk
                />
                <Divider my="xs" label="Or" labelPosition="center" />
                <Select
                  placeholder="Channel"
                  data={channelData}
                  value={channelId}
                  onChange={setChannelID}
                  searchable
                  mb="md"
                />
                <Group mt={5} mb={10}>
                  <Select
                    className={classes.qualitySelect}
                    placeholder="Resolution"
                    value={archiveQuality}
                    onChange={setArchiveQuality}
                    data={qualityOptions}
                    comboboxProps={{ position: 'bottom', middlewares: { flip: false, shift: false } }}
                  />
                  <Switch
                    checked={archiveChat}
                    onChange={setArchiveChat}
                    label="Archive Chat"
                    color="violet"
                  />
                  <Switch
                    checked={renderChat}
                    onChange={setRenderChat}
                    label="Render Chat"
                    color="violet"
                  />
                </Group>
                <Button
                  onClick={() => archiveVodSubmit.mutate()}
                  fullWidth
                  radius="md"
                  mt={1}
                  size="md"
                  color="violet"
                  loading={archiveSubmitLoading}
                >
                  Archive
                </Button>
              </Card>
              {twitchVodInfo?.id && <VodPreview vod={twitchVodInfo} />}
            </div>
          </Center>
        </Container>
      </div>
    </Authorization>
  );
};

export default ArchivePage;
