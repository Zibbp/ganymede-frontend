import { ActionIcon, Center } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import getConfig from "next/config";
import React from "react";
import { Video } from "../../ganymede-defs";
import { escapeURL } from "../../util/util";
import classes from "./LoginRequired.module.css"

const VodLoginRequired = (vod: Video) => {
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
