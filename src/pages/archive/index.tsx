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
  createStyles,
  Switch,
} from "@mantine/core";
import { useDocumentTitle, useInputState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { VodPreview } from "../../components/Archive/VodPreview";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import { useApi } from "../../hooks/useApi";

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

const useStyles = createStyles((theme) => ({
  card: {
    overflow: "visible",
  },
}));

const ArchivePage = () => {
  const { classes, cx, theme } = useStyles();
  const [archiveInput, setArchiveInput] = useInputState("");
  const [archiveSubmitLoading, setArchiveSubmitLoading] = useState(false);
  const [twitchVodInfo, setTwitchVodInfo] = useState<TwitchVODResponse | null>(
    null
  );
  const [archiveChat, setArchiveChat] = useInputState(true);
  const [archiveQuality, setArchiveQuality] = useInputState<string | null>(
    "best"
  );

  useDocumentTitle("Ganymede - Archive");

  const qualityOptions = [
    { label: "Best", value: "best" },
    { label: "720p60", value: "720p60" },
    { label: "480p30", value: "480p30" },
    { label: "360p30", value: "360p30" },
    { label: "160p30", value: "160p30" },
  ];

  const archiveVodSubmit = useMutation({
    mutationKey: ["archive-vod"],
    mutationFn: () => {
      if (archiveInput == "") {
        return;
      }
      setArchiveSubmitLoading(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/archive/vod`,
          data: {
            vod_id: archiveInput,
            quality: archiveQuality,
            chat: archiveChat,
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
    },
  });

  const getVodInfo = useMutation({
    mutationKey: ["twitch-vod"],
    mutationFn: (id: string) => {
      // Get ID from the url
      if (id.includes("twitch.tv/videos/")) {
        id = id.split("twitch.tv/videos/")[1];
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
        <Container size="xs" mt={20}>
          <Center>
            <div style={{ width: "100%" }}>
              <Card
                className={classes.card}
                shadow="sm"
                p="lg"
                radius="md"
                withBorder
              >
                <Center mb={10}>
                  <div>
                    <Title>Archive VOD</Title>
                    <Center>
                      <Text>Enter ID or URL</Text>
                    </Center>
                  </div>
                </Center>
                <TextInput
                  value={archiveInput}
                  onChange={(e) => getVodInfo.mutate(e.currentTarget.value)}
                  placeholder="VOD ID"
                  withAsterisk
                />
                <Group mt={5} mb={5}>
                  <Select
                    placeholder="Resolution"
                    value={archiveQuality}
                    onChange={setArchiveQuality}
                    data={qualityOptions}
                    dropdownPosition="bottom"
                  />
                  <Switch
                    checked={archiveChat}
                    onChange={setArchiveChat}
                    label="Archive Chat"
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
            {/* Show VOD preview */}
          </Center>
        </Container>
      </div>
    </Authorization>
  );
};

export default ArchivePage;
