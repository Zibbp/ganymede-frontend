import React, { useEffect, useState } from "react";
import { IconBookmark, IconHeart, IconShare } from "@tabler/icons-react";
import {
  Card,
  Image,
  Text,
  ActionIcon,
  Badge,
  Group,
  Center,
  Avatar,
  createStyles,
  rem,
  Tooltip,
  ThemeIcon,
  Progress,
  Overlay,
  Loader,
} from "@mantine/core";
import { PlaybackData, Video } from "../../ganymede-defs";
import getConfig from "next/config";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";
import useUserStore, { UserState } from "../../store/user";
import { IconCircleCheck, IconMenu2 } from "@tabler/icons";
import { ROLES } from "../../hooks/useJsxAuth";
import { VodMenu } from "./Menu";
import Link from "next/link";
dayjs.extend(duration);
dayjs.extend(localizedFormat);

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  processingOverlay: {
    position: "absolute",
    top: "35%",
    transform: "translateY(-50%)",
    zIndex: 50,
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    width: "100%",
    textAlign: "center",
    opacity: 2,
  },

  videoImage: {
    pointerEvents: "none",
    cursor: "default",
  },

  durationBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    left: rem(12),
    pointerEvents: "none",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  watchedIcon: {
    position: "absolute",
    top: theme.spacing.sm,
    right: rem(12),
    pointerEvents: "none",
  },

  title: {
    marginTop: theme.spacing.xs,
    marginBottom: rem(2),
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[0]
        : theme.colors.gray[9],
  },

  progressBar: {
    marginTop: rem(-5),
  },

  footer: {
    marginTop: rem(5),
  },

  channelFooter: {
    marginTop: rem(5),
  },
}));

const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const VideoCard = ({
  video,
  playback,
  showChannel = false,
}: {
  video: Video;
  playback?: PlaybackData[];
  showChannel?: boolean;
}) => {
  const { classes, cx, theme } = useStyles();
  const { publicRuntimeConfig } = getConfig();
  const user: UserState = useUserStore();
  const [progress, setProgress] = useState(0);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (playback) {
      const videoInPlayback = playback.find((p: any) => p.vod_id === video.id);
      if (videoInPlayback) {
        if (videoInPlayback.status == "finished") {
          setWatched(true);
        }
        if (videoInPlayback.time) {
          const progress = (videoInPlayback.time / video.duration) * 100;
          setProgress(progress);
        }
      }
    }
  }, [playback]);

  const menuPermissions = () => {
    if (!user.isLoggedIn) {
      return false;
    }

    // If no roles return true
    if (user.role && user.role.length == 0) {
      return false;
    }

    // Check roles
    const roles = [ROLES.ADMIN, ROLES.EDITOR, ROLES.ARCHIVER];
    if (roles.length > 0) {
      return roles.includes(user.role);
    }

    return true;
  };

  return (
    <Card radius="md" className={cx(classes.card)} padding={5}>
      {video.processing && (
        <Overlay color="#000" opacity={0.55}>
          <div className={classes.processingOverlay}>
            <Text fw={700} size="xl">
              Processing
            </Text>
            <Loader color="violet" size="lg" />;
          </div>
        </Overlay>
      )}
      <Link href={video.processing ? `#` : `/vods/${video.id}`}>
        <Card.Section>
          <a>
            <Image
              className={classes.videoImage}
              src={`${publicRuntimeConfig.CDN_URL}${video.web_thumbnail_path}`}
            />
          </a>
          {Math.round(progress) > 0 && !watched && (
            <Tooltip label={`${Math.round(progress)}% watched`}>
              <Progress
                className={classes.progressBar}
                color="violet"
                radius={0}
                size="sm"
                value={progress}
              />
            </Tooltip>
          )}
        </Card.Section>
      </Link>

      <Badge className={classes.durationBadge} py={0} px={5}>
        <Text color="gray.2">{formatDuration(video.duration)}</Text>
      </Badge>

      {watched && (
        <ThemeIcon className={classes.watchedIcon} radius="xl" color="green">
          <IconCircleCheck />
        </ThemeIcon>
      )}
      <Link href={video.processing ? `#` : `/vods/${video.id}`}>
        <Tooltip label={video.title} withinPortal>
          <Text className={classes.title} fw={500} lineClamp={1}>
            {video.title}
          </Text>
        </Tooltip>
      </Link>

      {showChannel && (
        <Group position="apart" className={classes.channelFooter}>
          <Center>
            <Avatar
              src={`${publicRuntimeConfig.CDN_URL}${video.edges.channel.image_path}`}
              size={24}
              radius="xl"
              mr="xs"
            />
            <Link href={`/channels/${video.edges.channel.name}`}>
              <Text fz="sm" inline>
                {video.edges.channel.display_name}
              </Text>
            </Link>
          </Center>
        </Group>
      )}

      <Group position="apart" className={classes.footer}>
        <Center>
          <Tooltip
            label={`Streamed on ${new Date(
              video.streamed_at
            ).toLocaleString()}`}
          >
            <Badge color={theme.colorScheme === "dark" ? "gray" : "dark"}>
              <Text>
                {dayjs(video.streamed_at).format("YYYY/MM/DD")}{" "}
                {user.settings.moreUIDetails && (
                  <span>{dayjs(video.streamed_at).format("LT")}</span>
                )}
              </Text>
            </Badge>
          </Tooltip>
        </Center>

        <Group spacing={8} mr={0}>
          <Badge color={theme.colorScheme === "dark" ? "gray" : "dark"}>
            {video.type.toUpperCase()}
          </Badge>
          {/* <ActionIcon className={classes.action}>
            <IconHeart size="1rem" color={theme.colors.red[6]} />
          </ActionIcon> */}
          {/* <ActionIcon className={classes.action}>
            <IconBookmark size="1rem" color={theme.colors.yellow[7]} />
          </ActionIcon> */}
          {menuPermissions() && (
            <div>
              <VodMenu vod={video} style="card" />
            </div>
          )}
        </Group>
      </Group>
    </Card>
  );
};

export default VideoCard;
