import { Menu, Button, Text, ActionIcon, Modal } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconPhoto,
  IconMenu2,
  IconPlaylistAdd,
  IconInfoCircle,
  IconHourglassEmpty,
  IconHourglass,
  IconHourglassHigh,
  IconDotsVertical,
  IconTrashX,
} from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { VodInfoModalContent } from "./InfoModalContent";
import { VodPlaylistModalContent } from "./PlaylistModalContent";
import { ROLES, useJsxAuth } from "../../hooks/useJsxAuth";
import AdminVodDelete from "../Admin/Vods/Delete";

export const VodMenu = ({ vod, style }: any) => {
  const [playlistModalOpened, setPlaylistModalOpened] = useState(false);
  const [infoModalOpened, setInfoModalOpended] = useState(false);
  const [deletedOpened, setDeletedOpened] = useState(false);

  const queryClient = useQueryClient();

  const markAsWatched = useMutation({
    mutationKey: ["mark-as-watched", vod.id],
    mutationFn: () => {
      return useApi(
        {
          method: "POST",
          url: `/api/v1/playback/status`,
          data: {
            vod_id: vod.id,
            status: "finished",
          },
          withCredentials: true,
        },
        false
      ).then(() => {
        queryClient.invalidateQueries(["playback-data"]);
        showNotification({
          title: "Marked as Watched",
          message: "VOD has been successfully marked as watched",
        });
      });
    },
  });

  const markAsUnWatched = useMutation({
    mutationKey: ["mark-as-unwatched", vod.id],
    mutationFn: () => {
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/playback/${vod.id}`,
          withCredentials: true,
        },
        false
      ).then(() => {
        queryClient.invalidateQueries(["playback-data"]);
        showNotification({
          title: "Marked as UnWatched",
          message: "VOD has been successfully marked as unwatched",
        });
      });
    },
  });

  const openDeleteModal = () => {
    setDeletedOpened(true);
  };

  const closeDeleteModalCallback = () => {
    setDeletedOpened(false);
  };

  return (
    <div>
      <Menu shadow="md" width={200} position="top-end">
        {style == "card" && (
          <Menu.Target>
            <ActionIcon>
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
        )}
        {style == "header" && (
          <Menu.Target>
            <ActionIcon size="xl">
              <IconMenu2 />
            </ActionIcon>
          </Menu.Target>
        )}

        <Menu.Dropdown>
          <Menu.Label>Video Menu</Menu.Label>
          <Menu.Item
            onClick={() => setPlaylistModalOpened(true)}
            icon={<IconPlaylistAdd size={14} />}
          >
            Playlists
          </Menu.Item>
          <Menu.Item
            onClick={() => setInfoModalOpended(true)}
            icon={<IconInfoCircle size={14} />}
          >
            Info
          </Menu.Item>
          <Menu.Item
            onClick={() => markAsWatched.mutate()}
            icon={<IconHourglassHigh size={14} />}
          >
            Mark as Watched
          </Menu.Item>
          <Menu.Item
            onClick={() => markAsUnWatched.mutate()}
            icon={<IconHourglassEmpty size={14} />}
          >
            Mark as Unwatched
          </Menu.Item>
          {useJsxAuth({
            loggedIn: true,
            roles: [ROLES.ADMIN],
          }) && (
            <Menu.Item
              color="red"
              onClick={() => {
                openDeleteModal();
              }}
              icon={<IconTrashX size={14} />}
            >
              Delete
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
      <Modal
        opened={playlistModalOpened}
        onClose={() => setPlaylistModalOpened(false)}
        title="Playlists"
      >
        <VodPlaylistModalContent vod={vod} />
      </Modal>
      <Modal
        opened={infoModalOpened}
        onClose={() => setInfoModalOpended(false)}
        size="xl"
        title="VOD Information"
      >
        <VodInfoModalContent vod={vod} />
      </Modal>
      <Modal
        opened={deletedOpened}
        onClose={() => setDeletedOpened(false)}
        title="Delete Video"
      >
        <AdminVodDelete handleClose={closeDeleteModalCallback} vod={vod} />
      </Modal>
    </div>
  );
};
