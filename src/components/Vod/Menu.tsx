import {
  Menu,
  Button,
  Text,
  ActionIcon,
  Modal,
  createStyles,
  Switch,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconMenu2,
  IconPlaylistAdd,
  IconInfoCircle,
  IconHourglassEmpty,
  IconHourglassHigh,
  IconDotsVertical,
  IconTrashX,
  IconLock,
  IconLockOpen,
} from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { VodInfoModalContent } from "./InfoModalContent";
import { VodPlaylistModalContent } from "./PlaylistModalContent";
import { ROLES, useJsxAuth } from "../../hooks/useJsxAuth";
import AdminVodDelete from "../Admin/Vods/Delete";

const useStyles = createStyles((theme) => ({
  action: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
    }),
  },
}));

export const VodMenu = ({ vod, style }: any) => {
  const { classes, cx, theme } = useStyles();
  const [playlistModalOpened, setPlaylistModalOpened] = useState(false);
  const [infoModalOpened, setInfoModalOpended] = useState(false);
  const [deletedOpened, setDeletedOpened] = useState(false);
  const isLocked = useRef(false);

  useEffect(() => {
    if (vod.locked) {
      isLocked.current = true;
    }
  }, [vod]);

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

  const lockVod = useMutation({
    mutationKey: ["lock-vod", vod.id],
    mutationFn: (lock: boolean) => {
      return useApi(
        {
          method: "POST",
          url: `/api/v1/vod/${vod.id}/lock?locked=${lock}`,
          withCredentials: true,
        },
        false
      ).then(() => {
        queryClient.invalidateQueries(["vod", vod.id]);
        showNotification({
          title: "Video Updated",
          message: `Video has been ${lock ? "locked" : "unlocked"}`,
        });
        if (lock == true) {
          isLocked.current = true;
        } else {
          isLocked.current = false;
        }
        console.log(isLocked.current);
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
          title: "Marked as Unwatched",
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
      <Menu shadow="md" width={200} position="top-end" withinPortal>
        {style == "card" && (
          <Menu.Target>
            <ActionIcon className={classes.action} color="dark">
              <IconMenu2 size="1rem" />
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
          {isLocked.current ? (
            <Menu.Item
              onClick={() => lockVod.mutate(false)}
              icon={<IconLockOpen size={14} />}
            >
              Unlock
            </Menu.Item>
          ) : (
            <Menu.Item
              onClick={() => lockVod.mutate(true)}
              icon={<IconLock size={14} />}
            >
              Lock
            </Menu.Item>
          )}
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
