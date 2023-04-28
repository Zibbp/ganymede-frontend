import {
  Card,
  Image,
  Text,
  Tooltip,
  Badge,
  Button,
  Group,
  createStyles,
  Overlay,
  Center,
  Loader,
  Title,
  Progress,
  ThemeIcon,
  ActionIcon,
} from "@mantine/core";
import Link from "next/link";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useEffect, useState } from "react";
import { IconCircleCheck, IconDotsVertical } from "@tabler/icons";
import getConfig from "next/config";
import { useHover } from "@mantine/hooks";
import { ROLES, useJsxAuth } from "../../hooks/useJsxAuth";
import { VodMenu } from "./Menu";
import useUserStore, { UserState } from "../../store/user";
dayjs.extend(duration);
dayjs.extend(localizedFormat);

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor: "transparent",
    overflow: "visible"
  },
  dateBadge: {
    position: "absolute",
    top: "5px",
    right: "5px",
    pointerEvents: "none",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  durationBadge: {
    position: "absolute",
    top: "5px",
    left: "5px",
    pointerEvents: "none",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  processingOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    zIndex: 2,
    borderRadius: theme.radius.sm,
  },
  processingContent: {
    margin: 0,
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
  },
  processingText: {
    color: theme.white,
  },
  progressBar: {
    marginTop: "-0.3rem",
  },
  watchedIcon: {
    position: "absolute",
    top: "2px",
    right: "2px",
  },
  typeBadge: {
    marginTop: "0.3rem",
  },
  vodTitle: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[2]
        : theme.colors.dark[8],
    fontFamily: `Inter, ${theme.fontFamily}`,
    fontWeight: 600,
  },
  infoBar: {
    display: "flex",
  },
  infoBarRight: {
    display: "flex",
    marginLeft: "auto",
    order: 2,
  },
  infoBarText: {
    fontFamily: `Inter, ${theme.fontFamily}`,
    fontWeight: 400,
    fontSize: "15px",
    marginTop: "0.1rem",
  },
  badgeText: {
    fontFamily: `Inter, ${theme.fontFamily}`,
    fontWeight: 400,
  },
  image: {
    width: "100%",
    height: "auto",
  },
  menuIcon: {
    // position: "absolute",
    // bottom: "0px",
    // right: "0px",
    // zIndex: 2,
    // marginTop: "-0.5rem",
    marginLeft: "0.2em",
  },
}));

export const VodCard = ({ vod, playback }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const { classes, cx, theme } = useStyles();
  const [progress, setProgress] = useState(0);
  const [watched, setWatched] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { hovered, ref } = useHover();

  useEffect(() => {
    if (playback) {
      // Check if vod is in playback array
      const vodInPlayback = playback.find((p: any) => p.vod_id === vod.id);
      if (vodInPlayback) {
        if (vodInPlayback.status == "finished") {
          setWatched(true);
        }
        if (vodInPlayback.time) {
          const progress = (vodInPlayback.time / vod.duration) * 100;
          setProgress(progress);
        }
      } else {
        setWatched(false);
        setProgress(0);
      }
    }
  }, [playback]);

  const user: UserState = useUserStore();
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

  const preloadImage = (url) => {
    const image = new window.Image();
    image.src = url;
  };

  const handleImageLoaded = () => {
    setImageLoaded(true);
  };

  const imageStyle = !imageLoaded ? { display: "none" } : {};

  useEffect(() => {
    preloadImage(`${publicRuntimeConfig.CDN_URL}${vod.web_thumbnail_path}`);
  }, [vod.web_thumbnail_path]);

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div ref={ref}>
      {!vod.processing ? (
        <Link href={"/vods/" + vod.id}>
          <Card className={classes.card} p={0} radius={0}>
            <Card.Section style={{ position: "relative" }}>
              {!imageLoaded && (
                <img
                  src="/images/ganymede-thumbnail.webp"
                  className={classes.image}
                  alt={vod.title}
                />
              )}
              <img
                src={`${publicRuntimeConfig.CDN_URL}${vod.web_thumbnail_path}`}
                onLoad={() => {
                  handleImageLoaded();
                }}
                className={classes.image}
                style={imageStyle}
                alt={vod.title}
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

            <Badge py={0} px={5} className={classes.durationBadge} radius="xs">
              <Text className={classes.badgeText} color="gray.2">
                {formatDuration(vod.duration)}
              </Text>
            </Badge>
            {watched && (
              <div className={classes.watchedIcon}>
                <Tooltip label="Watched">
                  <ThemeIcon className={classes.watchedIcon} color="green">
                    <IconCircleCheck />
                  </ThemeIcon>
                </Tooltip>
              </div>
            )}

            <Text mt={5} lineClamp={2} weight={500}>
              <Tooltip
                inline
                openDelay={500}
                closeDelay={100}
                multiline
                label={vod.title}
                className={classes.vodTitle}
              >
                <span>{vod.title}</span>
              </Tooltip>
            </Text>

            <div className={classes.infoBar}>
              <Tooltip
                label={`Streamed At ${new Date(
                  vod.streamed_at
                ).toLocaleString()}`}
              >
                <Text className={classes.infoBarText}>
                  {dayjs(vod.streamed_at).format("YYYY/MM/DD")}{" "}
                  {user.settings.moreUIDetails && (
                    <span>{dayjs(vod.streamed_at).format("LT")}</span>
                  )}
                </Text>
              </Tooltip>

              <div className={classes.infoBarRight}>
                <Tooltip label="Video Type">
                  <Badge
                    color={theme.colorScheme === "dark" ? "gray" : "dark"}
                    className={classes.typeBadge}
                  >
                    {vod.type.toUpperCase()}
                  </Badge>
                </Tooltip>
                {menuPermissions() && (
                  // hovered ? (
                  <div
                    className={classes.menuIcon}
                    onClick={(e) => e.preventDefault()}
                  >
                    <VodMenu vod={vod} style="card" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ) : (
        <Card className={classes.card} p="0" radius={0}>
          <Card.Section>
            {!imageLoaded && (
              <img
                src="/images/ganymede-thumbnail.webp"
                className={classes.image}
                alt={vod.title}
              />
            )}
            <img
              src={`${publicRuntimeConfig.CDN_URL}${vod.web_thumbnail_path}`}
              onLoad={() => {
                handleImageLoaded();
              }}
              className={classes.image}
              style={imageStyle}
              alt={vod.title}
            />
          </Card.Section>
          <div className={classes.processingOverlay}>
            <Center>
              <div className={classes.processingContent}>
                <div>
                  <Center>
                    <Loader color="violet" size="lg" />
                  </Center>
                </div>
                <Text className={classes.processingText} size="xl" weight={700}>
                  ARCHIVING
                </Text>
              </div>
            </Center>
          </div>

          <Badge py={0} px={5} className={classes.durationBadge} radius="xs">
            <Text color="gray.2" className={classes.badgeText}>
              {formatDuration(vod.duration)}
            </Text>
          </Badge>
          {watched && (
            <div className={classes.watchedIcon}>
              <Tooltip label="Watched">
                <ThemeIcon className={classes.watchedIcon} color="green">
                  <IconCircleCheck />
                </ThemeIcon>
              </Tooltip>
            </div>
          )}

          <Text mt={5} lineClamp={2} weight={500}>
            <Tooltip
              inline
              openDelay={500}
              closeDelay={100}
              multiline
              label={vod.title}
            >
              <Text className={classes.vodTitle}>{vod.title}</Text>
            </Tooltip>
          </Text>

          <div className={classes.infoBar}>
            <Tooltip
              label={`Streamed At ${new Date(
                vod.streamed_at
              ).toLocaleString()}`}
            >
              <Text className={classes.infoBarText}>
                {dayjs(vod.streamed_at).format("YYYY/MM/DD")}{" "}
                {user.settings.moreUIDetails && (
                  <span>{dayjs(vod.streamed_at).format("LT")}</span>
                )}
              </Text>
            </Tooltip>
            <div className={classes.infoBarRight}>
              <Tooltip label="Video Type">
                <Badge color={theme.colorScheme === "dark" ? "gray" : "dark"}>
                  {vod.type.toUpperCase()}
                </Badge>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
