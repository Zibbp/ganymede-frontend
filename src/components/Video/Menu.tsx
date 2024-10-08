import {
  Menu,
  Button,
  Text,
  ActionIcon,
  Modal,
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
  IconShare,
  IconPhoto,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { VodInfoModalContent } from "./InfoModalContent";
import { VodPlaylistModalContent } from "./PlaylistModalContent";
import { ROLES, useJsxAuth } from "../../hooks/useJsxAuth";
import AdminVodDelete from "../Admin/Vods/Delete";
import vodDataBus from "./EventBus";

export const VodMenu = ({ vod, style }: any) => {
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

  const generateStaticThumbnail = useMutation({
    mutationKey: ["generate-static-thumbnail", vod.id],
    mutationFn: () => {
      return useApi(
        {
          method: "POST",
          url: `/api/v1/vod/${vod.id}/generate-static-thumbnail`,
          withCredentials: true,
        },
        false
      ).then(() => {
        showNotification({
          title: "Task Queued",
          message: "Queued task to regenerate static thumbnail",
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

  const shareVideo = () => {
    let shareUrl: string = "";
    const url = window.location.origin;

    // check if we are on a vod page
    if (window.location.pathname.includes("/vods/") && window.location.pathname.includes(vod.id)) {
      // get the current time
      const { time } = vodDataBus.getData();
      const roundedTime = Math.ceil(time);
      // create the url
      shareUrl = `${url}/vods/${vod.id}?t=${roundedTime}`;
    } else {
      // create the url
      shareUrl = `${url}/vods/${vod.id}`;
    }

    // copy the url to the clipboard
    try {
      navigator.clipboard.writeText(shareUrl);

      // show a notification
      showNotification({
        title: "Copied to Clipboard",
        message: "The video url has been copied to your clipboard",
      });

    } catch (err) {
      console.error(err);
      // show a notification
      showNotification({
        title: "Error",
        message: "The clipboard API requires HTTPS, falling back to a prompt",
        color: "red",
      });

      // fallback to a prompt
      prompt("Copy to clipboard: Ctrl+C, Enter", shareUrl);
    }
  }

  return (
    <div>
      <Menu shadow="md" width={225} position="top-end" withinPortal>
        {style == "card" && (
          <Menu.Target>
            <ActionIcon color="gray" variant="subtle">
              <IconMenu2 size="1rem" />
            </ActionIcon>
          </Menu.Target>
        )}
        {style == "header" && (
          <Menu.Target>
            <ActionIcon size="xl" color="gray" variant="subtle">
              <IconMenu2 />
            </ActionIcon>
          </Menu.Target>
        )}

        <Menu.Dropdown>
          <Menu.Item
            onClick={() => setPlaylistModalOpened(true)}
            leftSection={<IconPlaylistAdd size={14} />}
          >
            Playlists
          </Menu.Item>
          <Menu.Item
            onClick={() => setInfoModalOpended(true)}
            leftSection={<IconInfoCircle size={14} />}
          >
            Info
          </Menu.Item>
          <Menu.Item
            onClick={() => markAsWatched.mutate()}
            leftSection={<IconHourglassHigh size={14} />}
          >
            Mark as Watched
          </Menu.Item>
          <Menu.Item
            onClick={() => markAsUnWatched.mutate()}
            leftSection={<IconHourglassEmpty size={14} />}
          >
            Mark as Unwatched
          </Menu.Item>
          {isLocked.current ? (
            <Menu.Item
              onClick={() => lockVod.mutate(false)}
              leftSection={<IconLockOpen size={14} />}
            >
              Unlock
            </Menu.Item>
          ) : (
            <Menu.Item
              onClick={() => lockVod.mutate(true)}
              leftSection={<IconLock size={14} />}
            >
              Lock
            </Menu.Item>

          )}
          <Menu.Item
            onClick={() => generateStaticThumbnail.mutate()}
            leftSection={<IconPhoto size={14} />}
          >
            Regenerate Thumbnail
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
                leftSection={<IconTrashX size={14} />}
              >
                Delete
              </Menu.Item>
            )}
          <Menu.Item
            onClick={() => shareVideo()}
            leftSection={<IconShare size={14} />}
          >
            Share
          </Menu.Item>
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
