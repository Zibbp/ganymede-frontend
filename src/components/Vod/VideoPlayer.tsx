import Plyr, { APITypes, PlyrInstance } from "plyr-react";
import "plyr-react/plyr.css";
import { createStyles } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import vodDataBus from "./EventBus";
import useUserStore from "../../store/user";
import { useApi } from "../../hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import getConfig from "next/config";

const useStyles = createStyles((theme) => ({}));

export const VodVideoPlayer = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);
  const ref = useRef<APITypes>(null);
  const [playback, setPlayback] = useState(false);

  const { classes, cx, theme } = useStyles();

  const plyrProps = {
    source: {
      type: "video",
      title: vod.title,
      sources: [
        {
          src: `${publicRuntimeConfig.CDN_URL}${vod.video_path}`,
          type: "video/mp4",
          size: 1080,
        },
      ],
      poster: `${publicRuntimeConfig.CDN_URL}${vod.thumbnail_path}`,
    },
    options: {
      settings: ["captions", "quality", "speed", "loop"],
    },
  };

  // Fetch playback data

  const { data: playbackData } = useQuery({
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
        return res?.data;
      }),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      vodDataBus.setData({
        time: ref.current?.plyr.currentTime,
        playing: ref.current?.plyr.playing,
        paused: ref.current?.plyr.paused,
      });
    }, 50);

    // Set playback data
    console.log(playbackData);
    const intervalPlaybackData = setInterval(() => {
      if (playbackData) {
        ref.current.plyr.currentTime = playbackData.time;
        if (ref.current?.plyr.currentTime - playbackData.time <= 1) {
          clearInterval(intervalPlaybackData);
        }
      }
    }, 500);

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
  }, [playbackData]);

  return (
    <div style={{ height: "100%", maxHeight: "100%" }}>
      <Plyr ref={ref} {...plyrProps} />
    </div>
  );
};
