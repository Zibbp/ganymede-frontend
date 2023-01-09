import {
  Button,
  Divider,
  Group,
  Select,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";

const AdminWatchedDrawer = ({ handleClose, watched, mode }) => {
  const { handleSubmit } = useForm();
  const [id, setId] = useState("");
  const [watchLive, setWatchLive] = useState(false);
  const [watchVod, setWatchVod] = useState(false);
  const [downloadArchives, setDownloadArchives] = useState(true);
  const [downloadHighlights, setDownloadHighlights] = useState(true);
  const [downloadUploads, setDownloadUploads] = useState(true);
  const [resolution, setResolution] = useState("best");
  const [archiveChat, setArchiveChat] = useState(true);
  const [lastLive, setLastLive] = useState(watched?.last_live);
  const [channelId, setChannelId] = useState("");

  const [channelData, setChannelData] = useState([]);
  const [loading, setLoading] = useState(false);

  const qualityOptions = [
    { label: "Best", value: "best" },
    { label: "720p60", value: "720p60" },
    { label: "480p30", value: "480p30" },
    { label: "360p30", value: "360p30" },
    { label: "160p30", value: "160p30" },
  ];

  useEffect(() => {
    if (mode == "edit") {
      setId(watched?.id);
      setWatchLive(watched?.watch_live);
      setWatchVod(watched?.watch_vod);
      setDownloadArchives(watched?.download_archives);
      setDownloadHighlights(watched?.download_highlights);
      setDownloadUploads(watched?.download_uploads);
      setResolution(watched?.resolution);
      setArchiveChat(watched?.archive_chat);
      setLastLive(watched?.last_live);
      setChannelId(watched?.edges.channel.id);
    }
  }, []);

  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation({
    mutationKey: ["create-watched"],
    mutationFn: () => {
      if (mode == "edit") {
        setLoading(true);
        return useApi(
          {
            method: "PUT",
            url: `/api/v1/live/${id}`,
            data: {
              resolution: resolution,
              archive_chat: archiveChat,
              watch_live: watchLive,
              watch_vod: watchVod,
              download_archives: downloadArchives,
              download_highlights: downloadHighlights,
              download_uploads: downloadUploads,
            },
            withCredentials: true,
          },
          false
        )
          .then(() => {
            queryClient.invalidateQueries(["admin-watched"]);
            setLoading(false);
            showNotification({
              title: "Watched Channel Updated",
              message: "Watched channel has been updated successfully",
            });
            handleClose();
          })
          .catch((err) => {
            setLoading(false);
          });
      }
      if (mode == "create") {
        setLoading(true);
        return useApi(
          {
            method: "POST",
            url: `/api/v1/live`,
            data: {
              channel_id: channelId,
              resolution: resolution,
              archive_chat: archiveChat,
              watch_live: watchLive,
              watch_vod: watchVod,
              download_archives: downloadArchives,
              download_highlights: downloadHighlights,
              download_uploads: downloadUploads,
            },
            withCredentials: true,
          },
          false
        )
          .then(() => {
            queryClient.invalidateQueries(["admin-watched"]);
            setLoading(false);
            showNotification({
              title: "Watched hannel Created",
              message: "Watched Channel has been created successfully",
            });
            handleClose();
          })
          .catch((err) => {
            setLoading(false);
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

  return (
    <div>
      <form onSubmit={handleSubmit(mutate)}>
        <TextInput
          value={id}
          onChange={(e) => setId(e.currentTarget.value)}
          placeholder="Auto Generated"
          label="ID"
          disabled
          mb="xs"
        />
        <Select
          label="Channel"
          placeholder="ganymede"
          data={channelData}
          value={channelId}
          onChange={setChannelId}
          searchable
          disabled={mode == "edit"}
          mb="xs"
        />

        <Select
          label="Quality"
          placeholder="best"
          data={qualityOptions}
          value={resolution}
          onChange={setResolution}
          searchable
          mb="xs"
        />

        <Switch
          label="Archive Chat"
          checked={archiveChat}
          onChange={(e) => setArchiveChat(e.currentTarget.checked)}
          mb={20}
        />

        <Divider my="md" size="md" />
        <div>
          <Title order={3}>Live Streams</Title>
          <Text>Archive live streams as they are broadcasted.</Text>
          <Switch
            mt={5}
            label="Watch Live Streams"
            checked={watchLive}
            onChange={(e) => setWatchLive(e.currentTarget.checked)}
          />
        </div>
        <Divider my="md" size="md" />
        <div>
          <Title order={3}>Channel Videos</Title>
          <Text>Archive past channel videos.</Text>
          <Text size="xs" italic>
            Check for new videos occurs once a day.
          </Text>
          <Switch
            mt={5}
            label="Watch Videos to Archive"
            checked={watchVod}
            onChange={(e) => setWatchVod(e.currentTarget.checked)}
          />
          <div style={{ marginLeft: "55px" }}>
            <Text mb={5} size="sm">
              Select which video types to archive.
            </Text>
            <Switch
              mt={5}
              label="Download Archives"
              description="Download past live streams"
              checked={downloadArchives}
              onChange={(e) => setDownloadArchives(e.currentTarget.checked)}
            />

            <Switch
              mt={5}
              label="Download Highlights"
              description="Download past highlights"
              checked={downloadHighlights}
              onChange={(e) => setDownloadHighlights(e.currentTarget.checked)}
            />

            <Switch
              mt={5}
              label="Download Uploads"
              description="Download past uploads"
              checked={downloadUploads}
              onChange={(e) => setDownloadUploads(e.currentTarget.checked)}
            />
          </div>
        </div>

        <Button
          mt={25}
          type="submit"
          fullWidth
          radius="md"
          size="md"
          color="violet"
          loading={loading}
        >
          {mode == "edit" ? "Update Watched Channel" : "Create Watched Channel"}
        </Button>
      </form>
    </div>
  );
};

export default AdminWatchedDrawer;
