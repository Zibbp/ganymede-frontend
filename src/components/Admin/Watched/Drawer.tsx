import {
  Button,
  Divider,
  Group,
  Loader,
  MultiSelect,
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
import GanymedeLoader from "../../Utils/GanymedeLoader";

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
  const [renderChat, setRenderChat] = useState(true);
  const [lastLive, setLastLive] = useState(watched?.last_live);
  const [channelId, setChannelId] = useState([]);
  const [downloadSubOnly, setDownloadSubOnly] = useState(false);

  const [channelData, setChannelData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [twitchCategoriesLoading, setTwitchCategoriesLoading] = useState(false);
  const [formattedTwitchCategories, setFormattedTwitchCategories] = useState(
    []
  );
  const [selectedTwitchCategories, setSelectedTwitchCategories] = useState([]);

  const qualityOptions = [
    { label: "Best", value: "best" },
    { label: "720p60", value: "720p60" },
    { label: "480p", value: "480p" },
    { label: "360p", value: "360p" },
    { label: "160p", value: "160p" },
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
      setChannelId([...channelId, watched?.edges.channel.id]);
      setRenderChat(watched?.render_chat);
      setDownloadSubOnly(watched?.download_sub_only);

      if (watched?.edges?.categories) {
        const tmpArr = [];
        watched?.edges?.categories.forEach((category) => {
          tmpArr.push(category.name);
        });
        setSelectedTwitchCategories(tmpArr);
      }
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
              render_chat: renderChat,
              download_sub_only: downloadSubOnly,
              categories: selectedTwitchCategories,
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

        const requestRoute = () => {
          if (channelId.length > 1) {
            return useApi(
              {
                method: "POST",
                url: `/api/v1/live/multiple`,
                data: {
                  channel_id: channelId,
                  resolution: resolution,
                  archive_chat: archiveChat,
                  watch_live: watchLive,
                  watch_vod: watchVod,
                  download_archives: downloadArchives,
                  download_highlights: downloadHighlights,
                  download_uploads: downloadUploads,
                  render_chat: renderChat,
                  download_sub_only: downloadSubOnly,
                  categories: selectedTwitchCategories,
                },
                withCredentials: true,
              },
              false
            );
          } else {
            return useApi(
              {
                method: "POST",
                url: `/api/v1/live`,
                data: {
                  channel_id: channelId[0],
                  resolution: resolution,
                  archive_chat: archiveChat,
                  watch_live: watchLive,
                  watch_vod: watchVod,
                  download_archives: downloadArchives,
                  download_highlights: downloadHighlights,
                  download_uploads: downloadUploads,
                  render_chat: renderChat,
                  download_sub_only: downloadSubOnly,
                  categories: selectedTwitchCategories,
                },
                withCredentials: true,
              },
              false
            );
          }
        };

        return requestRoute()
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

  // Fetch categories
  const { data: twitchCategoriesResp } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => {
      setTwitchCategoriesLoading(true);
      return useApi(
        {
          method: "GET",
          url: `/api/v1/twitch/categories`,
          withCredentials: true,
        },
        false
      )
        .then((res) => {
          // Format Twitch categories
          const tmpArr = [];
          res?.data.forEach((category) => {
            tmpArr.push({
              label: category.name,
              value: category.name,
            });
          });
          setFormattedTwitchCategories(tmpArr);
          setTwitchCategoriesLoading(false);
          return res?.data;
        })
        .catch((err) => {
          showNotification({
            title: "Error",
            message: "Error fetching Twitch categories",
          });
        });
    },
    refetchOnWindowFocus: false,
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
        <MultiSelect
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
          mb={10}
        />

        <Switch
          label="Archive Chat"
          checked={archiveChat}
          onChange={(e) => setArchiveChat(e.currentTarget.checked)}
          mb={10}
        />

        <Switch
          label="Render Chat"
          checked={renderChat}
          onChange={(e) => setRenderChat(e.currentTarget.checked)}
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
              Video Archive Settings.
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

            <Switch
              mt={5}
              label="Download Subscriber Only Videos"
              description="Do not check this if you are not a subscriber. Must have Twitch token set in Admin > Settings to download subscriber only videos."
              checked={downloadSubOnly}
              onChange={(e) => setDownloadSubOnly(e.currentTarget.checked)}
            />
          </div>
        </div>

        <Divider my="md" size="md" />
        <div>
          <Title order={3}>Advanced</Title>
        </div>
        <div>
          {twitchCategoriesLoading || formattedTwitchCategories.length == 0 ? (
            <Loader color="violet" />
          ) : (
            <MultiSelect
              searchable
              limit={20}
              value={selectedTwitchCategories}
              onChange={setSelectedTwitchCategories}
              data={formattedTwitchCategories}
              dropdownPosition="top"
              label="Archive specific video categories"
              placeholder="Search for a category"
              description="Archive only videos from these categories. Leave blank to archive all categories. Does not apply to live streams."
              clearButtonLabel="Clear selection"
              clearable
            />
          )}
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
