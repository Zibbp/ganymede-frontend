import { usePlyr } from "plyr-react";
import "plyr-react/plyr.css";
import { createStyles } from "@mantine/core";
import React, { useEffect, useRef } from "react";
import vodDataBus from "./EventBus";
import getConfig from "next/config";

const useStyles = createStyles((theme) => ({
  chatPlayer: {
    backgroundColor: "red",

    video: {
      bottom: 0,
      position: "absolute",
      height: "auto !important",
    },
  },
}));

const Plyr = React.forwardRef((props, ref) => {
  const { classes, cx, theme } = useStyles();
  const { source, options = null, ...rest } = props;
  const raptorRef = usePlyr(ref, {
    source,
    options,
  });
  return (
    <video
      ref={raptorRef}
      className={`plyr-react plyr ${classes.chatPlayer}`}
      {...rest}
    />
  );
});

export const VodChatPlayer = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const { classes, cx, theme } = useStyles();
  const ref = useRef();
  let player = null;
  let lastTime = 0;
  let ready = false;

  useEffect(() => {
    setTimeout(() => {
      const playerRef = ref.current;
      player = playerRef.plyr;
      ready = true;
    }, 250);

    const interval = setInterval(() => {
      const { time, playing, paused } = vodDataBus.getData();
      if (!ready) {
        return;
      }

      if (playing) {
        player.play();
      }
      if (paused) {
        player.pause();
      }

      if (Math.abs(time - lastTime) > 2) {
        player.currentTime = time;
      }
      lastTime = time;
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const plyrProps = {
    source: {
      type: "video",
      title: vod.title,
      sources: [
        {
          src: `${publicRuntimeConfig.CDN_URL}${vod.chat_video_path}`,
          type: "video/mp4",
          size: 1080,
        },
      ],
    },
    options: {
      settings: ["captions", "quality", "speed", "loop"],
      autoPlay: false,
      clickToPlay: false,
      controls: [],
    },
  };

  return (
    <div
      style={{ height: "100%", maxHeight: "100%" }}
      className={classes.chatPlayer}
    >
      <Plyr ref={ref} {...plyrProps} />
      {/* <Plyr
        ref={(player) => (this.player.current = player)}
        {...plyrProps}
        style={{ backgroundColor: "red" }}
      /> */}
    </div>
  );
};
