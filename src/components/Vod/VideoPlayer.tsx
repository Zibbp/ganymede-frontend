import { usePlyr } from "plyr-react";
import "plyr-react/plyr.css";
import { createStyles } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import vodDataBus from "./EventBus";
import useUserStore from "../../store/user";
import { useApi } from "../../hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import getConfig from "next/config";
import { showNotification } from "@mantine/notifications";
import Hls from "hls.js";

const useStyles = createStyles((theme) => ({}));

export const VodVideoPlayer = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);
  const ref = useRef();
  const [playback, setPlayback] = useState(false);

  const { classes, cx, theme } = useStyles();

  const plyrProps = {
    source: {
      type: "video",
      title: vod.title,
      sources: [
        // {
        //   src: `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        //   type: "video/mp4",
        // },
      ],
      poster: `${publicRuntimeConfig.CDN_URL}${vod.thumbnail_path}`,
    },
    options: {
      settings: ["captions", "quality", "speed", "loop"],
    },
  };

  // Fetch playback data

  const { data } = useQuery({
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
    queryKey: ["playback-data", vod.id],
    queryFn: async () =>
      useApi(
        {
          method: "GET",
          url: `/api/v1/playback/${vod.id}`,
          withCredentials: true,
        },
        true
      ).then((res) => {
        if (res != undefined) {
          return res.data;
        } else {
          return null;
        }
      }),
  });

  useEffect(() => {
    // Set playback data
    const intervalPlaybackData = setInterval(() => {
      console.debug("[Player] Set Playback Data - Waiting");
      if (data) {
        console.debug("[Player] Set Playback Data - Data Found");
        if (data && data.time > 1 && ref.current.plyr.ready) {
          console.debug("[Player] Set Playback Data - Set Time");
          ref.current.plyr.currentTime = data.time;
        }

        if (data?.time - ref.current.plyr.currentTime <= 1) {
          console.debug("[Player] Set Playback Data - Clear Interval");
          clearInterval(intervalPlaybackData);
        }
      }
    }, 500);

    return () => {
      clearInterval(intervalPlaybackData);
    };
  }, [data]);

  useEffect(() => {
    const loadPlayer = async () => {
      let loaded = false;
      while (!loaded) {
        if (ref.current?.plyr.ready) {
          loaded = true;
          console.log("VIDEO PLAYER LOAD");

          // Check if video is HLS
          if (vod.video_path.includes(".m3u8")) {
            console.log("HLS VIDEO");
            console.log(`${publicRuntimeConfig.CDN_URL}${vod.video_path}`);

            var hls = new Hls();
            hls.loadSource(`${publicRuntimeConfig.CDN_URL}${vod.video_path}`);
            hls.attachMedia(ref.current.plyr.media);
          }

          // Player loaded and ready

          // Set plyr source
          // ref.current.plyr.source = {
          //   type: "video",
          //   title: vod.title,
          //   sources: [
          //     {
          //       src: `${publicRuntimeConfig.CDN_URL}${vod.video_path}`,
          //       type: "video/mp4",
          //     },
          //   ],
          //   poster: `${publicRuntimeConfig.CDN_URL}${vod.thumbnail_path}`,
          // };

          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    loadPlayer();

    // Tick for chat player
    const interval = setInterval(() => {
      vodDataBus.setData({
        time: ref.current?.plyr.currentTime,
        playing: ref.current?.plyr.playing,
        paused: ref.current?.plyr.paused,
      });
    }, 50);

    // Playback progress reporting
    const playbackInterval = setInterval(async () => {
      // Update playback progress every 20 seconds
      if (
        ref.current?.plyr.playing &&
        user.isLoggedIn &&
        ref.current?.plyr.currentTime > 1
      ) {
        const currentTime = parseInt(ref.current?.plyr.currentTime);
        await useApi(
          {
            method: "POST",
            url: "/api/v1/playback/progress",
            data: {
              vod_id: vod.id,
              time: currentTime,
            },
            withCredentials: true,
          },
          false
        );
        // Check if progress is 99% of the video
        if (currentTime / vod.duration >= 0.99) {
          await useApi(
            {
              method: "POST",
              url: "/api/v1/playback/status",
              data: {
                vod_id: vod.id,
                status: "finished",
              },
              withCredentials: true,
            },
            false
          );
        }
      }
    }, 20000);

    return () => {
      clearInterval(interval);
      clearInterval(playbackInterval);
    };
  }, []);

  // });

  return (
    <div style={{ height: "100%", maxHeight: "100%" }}>
      <Plyr ref={ref} source={plyrProps.source} options={plyrProps.options} />
    </div>
  );
};

const Plyr = React.forwardRef((props, ref) => {
  const { source, options = null, ...rest } = props;
  const raptorRef = usePlyr(ref, {
    source,
    options,
  });
  return (
    <video
      ref={raptorRef}
      className="plyr-react plyr-vod-video plyr"
      {...rest}
    />
  );
});
