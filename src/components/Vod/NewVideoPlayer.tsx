import getConfig from "next/config";
import React, { useEffect, useRef, useState } from "react";
import { createStyles } from "@mantine/core";
import vodDataBus from "./EventBus";
import { useApi } from "../../hooks/useApi";
import useUserStore from "../../store/user";
import { useQuery } from "@tanstack/react-query";
import VideoJS from "./VideoJS";

const useStyles = createStyles((theme) => ({
  playerContainer: {
    width: "100%",
    height: "100%",
    minHeight: "100%",
  },
}));

const NewVideoPlayer = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const { classes, cx, theme } = useStyles();
  const user = useUserStore((state) => state);
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [videoJsOptions, setVideoJsOptions] = useState({});
  const [tapped, setTapped] = useState(false);

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

    const ext = vod.video_path.substr(vod.video_path.length - 4);
    let type = "video/mp4";
    if (ext == "m3u8") {
      type = "application/x-mpegURL";
    }

    const options = {
      autoplay: false,
      controls: true,
      playbackRates: [0.5, 1, 1.5, 2, 2.5],
      sources: [
        {
          src: `${publicRuntimeConfig.CDN_URL}${vod.video_path}`,
          type: type,
        },
      ],
      plugins: {
        hotkeys: {
          seekStep: 20,
          volumeStep: 0.1,
          enableVolumeScroll: false,
          enableHoverScroll: true,
          enableModifiersForNumbers: false,
        },
      },
    };

    // If thumbnail
    if (vod.thumbnail_path) {
      options.poster = `${publicRuntimeConfig.CDN_URL}${vod.thumbnail_path}`;
    }

    // If captions
    if (vod.caption_path) {
      options.tracks = [
        {
          kind: "captions",
          src: `${publicRuntimeConfig.CDN_URL}${vod.caption_path}`,
          srclang: "en",
          label: "Captions",
        },
      ];
    }

    setVideoJsOptions(options);

    setPlayerReady(true);
  }, [data]);

  // Mobile tap support
  // Single tap to play/pause
  // Double tap to seek +/- 10 seconds depending on side of screen
  let timeout: any;
  const handleTouchStart = (event) => {
    console.log(event);

    const player = playerRef.current;
    if (!tapped) {
      setTapped(true);
      timeout = setTimeout(() => setTapped(false), 300);
      if (player.paused()) {
        player.play();
      } else {
        player.pause();
      }
    } else {
      clearTimeout(timeout);
      setTapped(false);
      const currentTime = player.currentTime();
      const duration = player.duration();
      const seekTime =
        event.changedTouches[0].clientX < window.innerWidth / 2
          ? currentTime - 10
          : currentTime + 10;
      player.currentTime(Math.max(0, Math.min(seekTime, duration)));
      player.play();
    }
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // Show control bar on initial load
    player.addClass("vjs-has-started");

    // Volume
    const localVolume = localStorage.getItem("ganymede-volume");
    if (localVolume) {
      player.volume(localVolume);
    }

    player.on("volumechange", () => {
      localStorage.setItem("ganymede-volume", player.volume());
    });

    // Playback data
    if (data.time) {
      player.currentTime(data.time);
    }

    player.on("play", () => {
      player.bigPlayButton.hide();
    });

    player.on("pause", () => {
      player.bigPlayButton.show();
    });
  };

  // Tick for chat
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current == null) return;
      vodDataBus.setData({
        time: playerRef.current.currentTime(),
        paused: playerRef.current.paused(),
        playing: !playerRef.current.paused(),
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playerRef.current]);

  // Playback progress reporting
  useEffect(() => {
    const playbackInerval = setInterval(async () => {
      if (!user.isLoggedIn) return;
      if (playerRef.current == null) return;
      if (playerRef.current.paused()) return;

      const playbackData = {
        vod_id: vod.id,
        time: parseInt(playerRef.current.currentTime()),
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
    <div className={classes.playerContainer} onTouchStart={handleTouchStart}>
      {playerReady && (
        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
      )}
    </div>
  );
};

export default NewVideoPlayer;
