import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  MultiSelect,
  Select,
  SelectItem,
  Text,
} from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

async function fetchVodPlaylists(vodId: string) {
  return useApi(
    { method: "GET", url: `/api/v1/vod/${vodId}/playlist` },
    false
  ).then((res) => res?.data);
}

async function fetchPlaylists() {
  return useApi({ method: "GET", url: `/api/v1/playlist` }, false).then(
    (res) => res?.data
  );
}

export const VodPlaylistModalContent = ({ vod }: any) => {
  const queryClient = useQueryClient();
  const [value, setValue] = useState<string | null>(null);

  const {
    isLoading: isLoadingVP,
    error: errorVP,
    data: dataVP,
  } = useQuery({
    queryKey: ["vod-playlists", vod.id],
    queryFn: () => fetchVodPlaylists(vod.id),
  });

  const { isLoading, error, data } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => fetchPlaylists(),
  });

  const deleteVodFromPlaylistMutation = useMutation({
    mutationKey: ["delete-vod-from-playlist"],
    mutationFn: (playlistId: string) => {
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/playlist/${playlistId}/vod`,
          data: { vod_id: vod.id },
          withCredentials: true,
        },
        false
      ).then(() => {
        queryClient.invalidateQueries(["vod-playlists", vod.id]);
      });
    },
  });

  const addVodToPlaylistMutation = useMutation({
    mutationKey: ["add-vod-to-playlist"],
    mutationFn: () => {
      if (value === null) return;
      return useApi(
        {
          method: "POST",
          url: `/api/v1/playlist/${value}`,
          data: { vod_id: vod.id },
          withCredentials: true,
        },
        false
      ).then(() => {
        setValue(null);
        queryClient.invalidateQueries(["vod-playlists", vod.id]);
      });
    },
  });

  if (error) return <div>failed to load</div>;
  if (isLoading)
    return (
      <div>
        <LoadingOverlay visible={true} overlayBlur={0} />
      </div>
    );

  const playlists = [];
  data.forEach((playlist: any) => {
    playlists.push({
      label: playlist.name,
      value: playlist.id,
    });
  });

  return (
    <div style={{ minHeight: "10rem" }}>
      <Text size="lg" weight={500}>
        Add to Playlist
      </Text>
      <Group spacing={0}>
        <Select
          data={playlists}
          value={value}
          onChange={setValue}
          searchable
          placeholder="Select a Playlist"
          dropdownPosition="bottom"
        />
        <Button
          color="green"
          leftIcon={<IconPlus size={14} />}
          onClick={() => addVodToPlaylistMutation.mutate()}
          loading={addVodToPlaylistMutation.isLoading}
        >
          Add
        </Button>
      </Group>
      <Text size="lg" weight={500} pt={5}>
        Current Playlists:
      </Text>
      {dataVP &&
        dataVP.map((playlist: any) => (
          <div style={{ display: "flex" }} key={playlist.id}>
            <ActionIcon
              onClick={() => deleteVodFromPlaylistMutation.mutate(playlist.id)}
              color="red"
              loading={deleteVodFromPlaylistMutation.isLoading}
            >
              <IconX size={18} />
            </ActionIcon>
            <span style={{ marginTop: "1px" }}>{playlist.name}</span>
          </div>
        ))}
    </div>
  );
};
