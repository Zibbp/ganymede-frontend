import getConfig from "next/config";
import React, { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@mantine/core";
import vodDataBus from "./EventBus";
import { useApi } from "../../hooks/useApi";
import useUserStore from "../../store/user";
import { useQuery } from "@tanstack/react-query";

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { MediaPlayer, MediaPlayerInstance, MediaProvider, Poster, Track } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { IconDotsVertical, IconMaximize, IconMinimize } from "@tabler/icons-react";
import ReactDOM from "react-dom";
import TheaterModeIcon from "./TheaterModeIcon";
import { escapeURL } from "../../util/util";
import { useSearchParams } from 'next/navigation'
import { showNotification } from "@mantine/notifications";
import classes from "./VideoPlayer.module.css"
import eventBus from "../../util/eventBus";
// const useStyles = createStyles((theme) => ({
//   playerContainer: {
//     "--media-max-height": "87vh"
//   },
//   playerMediaOutlet: {
//     paddingBottom: "0",
//     height: "100%",
//   },
// }));

const NewVideoPlayer = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);
  const handleKeyRef = useRef<any>(null);

  const player = useRef<MediaPlayerInstance>(null)

  const [videoSource, setVideoSource] = useState([{ src: "", type: "" }]);
  const [videoType, setVideoType] = useState<string>("");
  const [videoPoster, setVideoPoster] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const startedPlayback = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const searchParams = useSearchParams()

  useEffect(() => {
    eventBus.on("theaterMode", (data) => {
      setIsFullscreen(data);
    });
  }, []);

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

  // start playback
  useEffect(() => {
    if (!data) return;
    if (startedPlayback.current) return;
    try {
      useApi(
        {
          method: "POST",
          url: `/api/v1/playback/start?video_id=${vod.id}`,
          withCredentials: false,
        },
        false
      ).then(() => {
        startedPlayback.current = true;
      })
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Failed to start playback",
        color: "red",
      });
    }
  }, [data])

  useEffect(() => {
    if (!data) return;

    if (!player) return;

    const ext = vod.video_path.substr(vod.video_path.length - 4);
    let type = "video/mp4";
    if (ext == "m3u8") {
      type = "application/x-mpegURL";
    }

    setVideoSource([
      {
        src: `${publicRuntimeConfig.CDN_URL}${escapeURL(vod.video_path)}`,
        type: type,
      },
    ]);
    setVideoType(type);
    setVideoTitle(vod.title);

    // If thumbnail
    if (vod.thumbnail_path) {
      setVideoPoster(
        `${publicRuntimeConfig.CDN_URL}${escapeURL(vod.video_path)}`
      );
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

    // Check if time is set in the url
    const time = searchParams.get("t");
    if (time) {
      player.current!.currentTime = parseInt(time);
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
    <div>
      <MediaPlayer
        className={
          isFullscreen
            ? classes.mediaPlayerTheaterMode
            : classes.mediaPlayer
        }
        src={videoSource}
        aspect-ratio={16 / 9}
        ref={player}
        crossOrigin={true}
        playsInline={true}
      >

        <MediaProvider >
          <Poster className="vds-poster" src={videoPoster} alt={vod.title} />
          <Track
            src={`${publicRuntimeConfig.API_URL}/api/v1/chapter/video/${vod.id}/webvtt`}
            kind="chapters"
            default={true}
          />
        </MediaProvider>

        <DefaultVideoLayout icons={defaultLayoutIcons} noScrubGesture={false}
          slots={{
            beforeFullscreenButton: <TheaterModeIcon />,
          }}
        />
      </MediaPlayer>
    </div>
  );
};

export default NewVideoPlayer;
