import getConfig from "next/config";
import React, { useEffect, useRef, useState } from "react";
import { createStyles } from "@mantine/core";
import vodDataBus from "./EventBus";
import { useApi } from "../../hooks/useApi";
import useUserStore from "../../store/user";
import { useQuery } from "@tanstack/react-query";
import { type MediaPlayerElement } from "vidstack";

import "vidstack/styles/defaults.css";
import "vidstack/styles/community-skin/video.css";

import {
  MediaCommunitySkin,
  MediaOutlet,
  MediaPlayer,
  MediaPoster,
  useMediaRemote,
} from "@vidstack/react";

const useStyles = createStyles((theme) => ({
  playerContainer: {
    width: "100%",
    height: "100%",
  },
  playerMediaOutlet: {
    paddingBottom: "0",
    height: "100%",
  },
}));

const NewVideoPlayer = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const { classes, cx, theme } = useStyles();
  const user = useUserStore((state) => state);
  const handleKeyRef = useRef<any>(null);

  const player = useRef<MediaPlayerElement>(null);
  const playerRemote = useMediaRemote(player);

  const [videoSource, setVideoSource] = useState<string>("");
  const [videoType, setVideoType] = useState<string>("");
  const [videoPoster, setVideoPoster] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");

  // Fetch playback data
  const { data } = useQuery({
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
    queryKey: ["playback-data-player", vod.id],
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
          return {
            error: "No playback data",
          };
        }
      }),
  });

  useEffect(() => {
    if (!data) return;

    if (!player) return;

    const ext = vod.video_path.substr(vod.video_path.length - 4);
    let type = "video/mp4";
    if (ext == "m3u8") {
      type = "application/x-mpegURL";
    }

    setVideoSource(`${publicRuntimeConfig.CDN_URL}${vod.video_path}`);
    setVideoType(type);
    setVideoTitle(vod.title);

    // If thumbnail
    if (vod.thumbnail_path) {
      setVideoPoster(`${publicRuntimeConfig.CDN_URL}${vod.thumbnail_path}`);
    }

    // If captions
    if (vod.caption_path) {
      // todo: add captions
    }

    // Volume
    const localVolume = localStorage.getItem("ganymede-volume");
    if (localVolume) {
      console.debug(`setting volume to ${parseFloat(localVolume)}`);
      player.current!.volume = parseFloat(localVolume);
    }

    player.current?.subscribe(({ volume }) => {
      localStorage.setItem("ganymede-volume", volume.toString());
    });

    // Playback data
    if (data.time) {
      player.current!.currentTime = data.time;
    }
  }, [data, player]);

  // Tick for chat
  useEffect(() => {
    const interval = setInterval(() => {
      if (player.current == null) return;
      vodDataBus.setData({
        time: player.current!.state.currentTime,
        paused: player.current!.state.paused,
        playing: player.current!.state.playing,
      });
    }, 100);
    return () => {
      clearInterval(interval);
      document.removeEventListener("keydown", handleKeyRef.current);
    };
  }, [player.current]);

  // Playback progress reporting
  useEffect(() => {
    const playbackInerval = setInterval(async () => {
      if (!user.isLoggedIn) return;
      if (player.current == null) return;
      if (player.current!.paused) return;

      const playbackData = {
        vod_id: vod.id,
        time: parseInt(player.current!.currentTime),
      };

      if (playbackData.time == 0) return;

      await useApi(
        {
          method: "POST",
          url: "/api/v1/playback/progress",
          data: playbackData,
          withCredentials: true,
        },
        false
      );

      // If progress is 98% or more, mark as watched
      if (playbackData.time / vod.duration >= 0.98) {
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

        // Remove interval
        clearInterval(playbackInerval);
      }
    }, 20000);
    return () => clearInterval(playbackInerval);
  });

  return (
    <div className={classes.playerContainer}>
      <MediaPlayer
        className={classes.playerContainer}
        src={videoSource}
        poster={videoPoster}
        aspect-ratio={16 / 9}
        ref={player}
      >
        <MediaOutlet className={classes.playerMediaOutlet}>
          <MediaPoster alt={videoTitle} />
        </MediaOutlet>
        <MediaCommunitySkin />
      </MediaPlayer>
    </div>
  );
};

export default NewVideoPlayer;
