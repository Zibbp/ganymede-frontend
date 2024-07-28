import React, { useEffect, useState } from "react";
import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  Center,
  Avatar,
  Tooltip,
  ThemeIcon,
  Progress,
  Loader,
  Flex,
  LoadingOverlay,
} from "@mantine/core";
import getConfig from "next/config";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";
import useUserStore, { UserState } from "../../../store/user";
import { IconCircleCheck, IconMenu2 } from "@tabler/icons-react";
import { ROLES } from "../../../hooks/useJsxAuth";
import { VodMenu } from "../Menu";
import Link from "next/link";
import { escapeURL } from "../../../util/util";
dayjs.extend(duration);
dayjs.extend(localizedFormat);
import classes from "./VideoCard.module.css";
import { Video } from "../../../types/video";

type Props = {
  video: Video
  progress: number
  showMenu: boolean
  showChannel: boolean
}

const VideoCard = ({ video, progress = 5, showMenu = true, showChannel = true }: Props) => {
  const { publicRuntimeConfig } = getConfig();
  const user: UserState = useUserStore();
  const [watched, setWatched] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
  };

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
    <Card radius="md" className={classes.card} padding={5}>
      {video.processing && (
        <LoadingOverlay visible zIndex={5} overlayProps={{ radius: "sm", blur: 1 }} loaderProps={{ children: <div><Text size="xl">Processing</Text><Center><Loader color="red" /></Center></div> }} />
      )}
      <Link href={video.processing ? `#` : `/vods/${video.id}`}>
        <Card.Section>
          <Image
            className={classes.videoImage}
            src={`${publicRuntimeConfig.CDN_URL}${escapeURL(
              video.web_thumbnail_path
            )}`}
            onError={handleError}
            width={imageError ? "100%" : "100%"}
            height={imageError ? "5rem" : "100%"}
            fallbackSrc="/images/ganymede-thumbnail.webp"
          />
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

      <Badge py={0} px={5} className={classes.durationBadge} radius="xs">
        <Text mt={1}>
          {dayjs
            .duration(video.duration, "seconds")
            .format("HH:mm:ss")}
        </Text>
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
        <Group className={classes.channelFooter}>
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

      <Flex gap="xs" justify="flex-start"
        align="center" pt={2}>

        <Tooltip
          label={`Streamed on ${new Date(
            video.streamed_at
          ).toLocaleString()}`}
        >

          <Text size="sm">
            {dayjs(video.streamed_at).format("YYYY/MM/DD")}{" "}
            {user.settings.moreUIDetails && (
              <span>{dayjs(video.streamed_at).format("LT")}</span>
            )}
          </Text>

        </Tooltip>



        <div className={classes.vodMenu}>
          <Badge variant="default" color="rgba(0, 0, 0, 1)" mt={4}>
            {video.type.toUpperCase()}
          </Badge>

          {(showMenu && menuPermissions()) && (
            <VodMenu vod={video} style="card" />
          )}
        </div>


      </Flex>



    </Card>
  );
};

export default VideoCard;
