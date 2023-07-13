import { ActionIcon, Center, createStyles } from "@mantine/core";
import { IconLock } from "@tabler/icons";
import getConfig from "next/config";
import React from "react";
import { Video } from "../../ganymede-defs";
import { escapeURL } from "../../util/util";

const useStyles = createStyles((theme) => ({
  container: {
    width: "100%",
    height: "calc(100vh - 60px - 60px)",
    maxHeight: "calc(100vh - 60px - 60px)",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(8px)",
    WebkitFilter: "blur(8px)",
  },
  textContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: theme.white,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "1rem",
    borderRadius: theme.radius.sm,
  },
  text: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  icon: {
    color: theme.colors.violet[7],
    marginBottom: "0.5rem",
  },
}));

const VodLoginRequired = (vod: Video) => {
  const { classes, cx, theme } = useStyles();
  const { publicRuntimeConfig } = getConfig();

  const getImageUrl = () => {
    if (vod.thumbnail_path) {
      return `${publicRuntimeConfig.CDN_URL}${escapeURL(vod.thumbnail_path)}`;
    } else {
      return "/images/landing-hero.webp";
    }
  };

  return (
    <div className={classes.container}>
      <div
        style={{ backgroundImage: `url(${getImageUrl()})` }}
        className={classes.thumbnail}
      ></div>
      <div className={classes.textContainer}>
        <Center>
          <IconLock size={64} className={classes.icon} />
        </Center>
        <div className={classes.text}>
          You must be logged in to view this video
        </div>
      </div>
    </div>
  );
};

export default VodLoginRequired;
