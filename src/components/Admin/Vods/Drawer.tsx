import {
  Button,
  Group,
  NumberInput,
  Select,
  Switch,
  TextInput,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";

const AdminVodDrawer = ({ handleClose, vod, mode }) => {
  const { handleSubmit } = useForm();
  const [id, setId] = useState(vod?.id);
  const [channelId, setChannelID] = useState<string | null>(
    vod?.edges.channel.id
  );
  const [extId, setExtId] = useState(vod?.ext_id);
  const [platform, setPlatform] = useState<string | null>(vod?.platform);
  const [type, setType] = useState<string | null>(vod?.type);
  const [title, setTitle] = useState(vod?.title);
  const [duration, setDuration] = useState(vod?.duration);
  const [views, setViews] = useState(vod?.views);
  const [resolution, setResolution] = useState(vod?.resolution);
  const [processing, setProcessing] = useState(vod?.processing);
  const [thumbnailPath, setThumbnailPath] = useState(vod?.thumbnail_path);
  const [webThumbnailPath, setWebThumbnailPath] = useState(
    vod?.web_thumbnail_path
  );
  const [videoPath, setVideoPath] = useState(vod?.video_path);
  const [chatPath, setChatPath] = useState(vod?.chat_path);
  const [chatVideoPath, setChatVideoPath] = useState(vod?.chat_video_path);
  const [infoPath, setInfoPath] = useState(vod?.info_path);
  const [captionPath, setCaptionPath] = useState(vod?.caption_path);
  const [streamedAt, setStreamedAt] = useState();

  const [loading, setLoading] = useState(false);

  const [channelData, setChannelData] = useState([]);

  const typeData = [
    { label: "Archive", value: "archive" },
    { label: "Live", value: "live" },
    { label: "Highlight", value: "highlight" },
    { label: "Clip", value: "clip" },
    { label: "Upload", value: "upload" },
  ];

  const platformData = [
    { label: "Twitch", value: "twitch" },
    { label: "Youtube", value: "youtube" },
  ];

  useEffect(() => {
    if (vod?.streamed_at) {
      setStreamedAt(new Date(vod?.streamed_at));
    } else {
      setStreamedAt(new Date());
    }
  }, []);

  const queryClient = useQueryClient();

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

  const { mutate, isLoading, error } = useMutation({
    mutationKey: ["create-vod"],
    mutationFn: () => {
      if (mode == "edit") {
        setLoading(true);

        return useApi(
          {
            method: "PUT",
            url: `/api/v1/vod/${id}`,
            data: {
              channel_id: channelId,
              ext_id: extId,
              platform: platform,
              type: type,
              title: title,
              duration: duration,
              views: views,
              resolution: resolution,
              processing: processing,
              thumbnail_path: thumbnailPath,
              web_thumbnail_path: webThumbnailPath,
              video_path: videoPath,
              chat_path: chatPath,
              chat_video_path: chatVideoPath,
              info_path: infoPath,
              caption_path: captionPath,
              streamed_at: streamedAt,
            },
            withCredentials: true,
          },
          false
        )
          .then(() => {
            queryClient.invalidateQueries(["admin-vods"]);
            setLoading(false);
            showNotification({
              title: "VOD Updated",
              message: "VOD has been updated successfully",
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
            url: `/api/v1/vod`,
            data: {
              channel_id: channelId,
              ext_id: extId,
              platform: platform,
              type: type,
              title: title,
              duration: duration,
              views: views,
              resolution: resolution,
              processing: processing,
              thumbnail_path: thumbnailPath,
              web_thumbnail_path: webThumbnailPath,
              video_path: videoPath,
              chat_path: chatPath,
              chat_video_path: chatVideoPath,
              info_path: infoPath,
              caption_path: captionPath,
              streamed_at: streamedAt,
            },
            withCredentials: true,
          },
          false
        )
          .then(() => {
            queryClient.invalidateQueries(["admin-vods"]);
            setLoading(false);
            showNotification({
              title: "VOD Updated",
              message: "VOD has been updated successfully",
            });
            handleClose();
          })
          .catch((err) => {
            setLoading(false);
          });
      }
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit(mutate)}>
        <Switch
          label="Is Processing"
          checked={processing}
          onChange={(e) => setProcessing(e.currentTarget.checked)}
        />
        <TextInput
          value={id}
          onChange={(e) => setId(e.currentTarget.value)}
          placeholder="Auto generated"
          label="ID"
          disabled
          mb="xs"
        />
        <TextInput
          value={extId}
          onChange={(e) => setExtId(e.currentTarget.value)}
          placeholder="123456789"
          label="External ID"
          required
          mb="xs"
        />

        <Select
          label="Channel"
          placeholder="ganymede"
          data={channelData}
          value={channelId}
          onChange={setChannelID}
          searchable
          required
          mb="xs"
        />

        <TextInput
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="Epic Stream Title"
          label="Title"
          required
          mb="xs"
        />

        <Select
          label="Type"
          placeholder="Archive"
          data={typeData}
          value={type}
          onChange={setType}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Platform"
          placeholder="Twitch"
          data={platformData}
          value={platform}
          onChange={setPlatform}
          searchable
          required
          mb="xs"
        />

        <Group mb="xs">
          <NumberInput
            placeholder="6837"
            label="Duration (seconds)"
            value={duration}
            onChange={(val) => setDuration(val)}
            required
          />
          <NumberInput
            placeholder="35412"
            label="Views"
            value={views}
            onChange={(val) => setViews(val)}
            required
          />
        </Group>

        <TextInput
          value={resolution}
          onChange={(e) => setResolution(e.currentTarget.value)}
          placeholder="best"
          label="Resolution"
          required
          mb="xs"
        />

        <DatePicker
          value={streamedAt}
          onChange={setStreamedAt}
          allowFreeInput
          placeholder="2022-11-04"
          label="Streamed At"
          mb="xs"
          required
        />

        <TextInput
          value={thumbnailPath}
          onChange={(e) => setThumbnailPath(e.currentTarget.value)}
          placeholder="/vods/channel/123_456/123-thumbnail.jpg"
          label="Thumbnail Path"
          mb="xs"
        />

        <TextInput
          value={webThumbnailPath}
          onChange={(e) => setWebThumbnailPath(e.currentTarget.value)}
          placeholder="/vods/channel/123_456/123-web_thumbnail.jpg"
          label="Web Thumbnail Path"
          required
          mb="xs"
        />

        <TextInput
          value={videoPath}
          onChange={(e) => setVideoPath(e.currentTarget.value)}
          placeholder="/vods/channel/123_456/123-video.mp4"
          label="Video Path"
          required
          mb="xs"
        />

        <TextInput
          value={chatPath}
          onChange={(e) => setChatPath(e.currentTarget.value)}
          placeholder="/vods/channel/123_456/123-chat.json"
          label="Chat Path"
          mb="xs"
        />

        <TextInput
          value={chatVideoPath}
          onChange={(e) => setChatVideoPath(e.currentTarget.value)}
          placeholder="/vods/channel/123_456/123-chat.mp4"
          label="Chat Video Path"
          mb="xs"
        />

        <TextInput
          value={captionPath}
          onChange={(e) => setCaptionPath(e.currentTarget.value)}
          placeholder="/vods/channel/123_456/123.vtt"
          label="Caption Path (vtt)"
          mb="xs"
        />

        <TextInput
          value={infoPath}
          onChange={(e) => setInfoPath(e.currentTarget.value)}
          placeholder="/vods/channel/123_456/123-info.json"
          label="Info Path"
          mb="xs"
        />

        <Button
          mt="xs"
          type="submit"
          fullWidth
          radius="md"
          size="md"
          color="violet"
          loading={loading}
        >
          {mode == "edit" ? "Update VOD" : "Create VOD"}
        </Button>
      </form>
    </div>
  );
};

export default AdminVodDrawer;
