import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  MultiSelect,
  Select,
  Text,
} from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import classes from "./PlaylistModalContent.module.css"

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
        <LoadingOverlay visible={true} />
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
    <div>
      <div className={classes.container}>
        <Select
          className={classes.selectPlaylist}
          data={playlists}
          value={value}
          onChange={setValue}
          searchable
          placeholder="Select a Playlist"
          w="100%"
        />
        <Button
          color="green"
          leftSection={<IconPlus size={14} />}
          onClick={() => addVodToPlaylistMutation.mutate()}
          loading={addVodToPlaylistMutation.isLoading}
        >
          Add
        </Button>
      </div>

      {dataVP &&
        dataVP.map((playlist: any) => (
          <div style={{ display: "flex", marginBottom: "0.5rem" }} key={playlist.id}>
            <ActionIcon
              onClick={() => deleteVodFromPlaylistMutation.mutate(playlist.id)}
              variant="light" color="red"
              loading={deleteVodFromPlaylistMutation.isPending}
              aria-label="Filled loading"
              mr={4}
            >
              <IconX size={18} />
            </ActionIcon>
            <span style={{ marginTop: "1px" }}>{playlist.name}</span>
          </div>
        ))}
    </div>
  );
};
