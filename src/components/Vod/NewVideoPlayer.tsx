import getConfig from "next/config";
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { createStyles } from "@mantine/core";
import vodDataBus from "./EventBus";
import { useApi } from "../../hooks/useApi";
import useUserStore from "../../store/user";
import { useQuery } from "@tanstack/react-query";

const useStyles = createStyles((theme) => ({}));

const NewVideoPlayer = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const { classes, cx, theme } = useStyles();
  const user = useUserStore((state) => state);

  const vplayer = useRef();

  const [player, setPlayer] = useState(null);

  const busTime = useRef(0);
  const busPlaying = useRef(false);
  const busPaused = useRef(true);

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
          return {
            error: "No playback data",
          };
        }
      }),
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    let started = false;
    const start = async () => {
      const OvenPlayer = await import("ovenplayer");

      // OvenPlayer.debug(true);

      // Figure out which type of video we're dealing with
      // Get last 4 characters of video path
      const ext = vod.video_path.substr(vod.video_path.length - 4);
      let type = "mp4";
      if (ext === "m3u8") {
        type = "hls";
      }

      const options = {
        title: vod.title,
        theme: "dark",
        controls: true,
        image: `${publicRuntimeConfig.CDN_URL}${vod.thumbnail_path}`,
        sources: [
          {
            label: `Archive - ${type}`,
            file: `${publicRuntimeConfig.CDN_URL}${vod.video_path}`,
            type: type,
          },
        ],
        // tracks: [
        //   {
        //     kind: "captions",
        //     file: "",
        //     label: "English",
        //   },
        // ],
      };

      // Get volume if stored
      const localVolume = localStorage.getItem("ganymede-volume");
      if (localVolume) {
        options.volume = Number(localVolume);
      }

      const _player = OvenPlayer.create(vplayer.current, options);

      _player.on("ready", () => {
        console.log(data);
        if (data.time) {
          _player.seek(data.time);
        }
      });

      // Set player
      setPlayer(_player);

      _player.on("time", (e) => {
        busTime.current = e.position;
      });

      _player.on("stateChanged", (e) => {
        if (e.newstate === "playing") {
          busPlaying.current = true;
          busPaused.current = false;
        }
        if (e.newstate === "paused") {
          busPlaying.current = false;
          busPaused.current = true;
        }
      });

      // Save volume on change
      _player.on("volumeChanged", (e) => {
        try {
          localStorage.setItem("ganymede-volume", e.volume);
        } catch (error) {
          console.error("error setting volume", error);
        }
      });
    };

    start();
  }, [data]);

  useEffect(() => {
    //! Tick for chat
    if (player) {
      const interval = setInterval(() => {
        vodDataBus.setData({
          time: busTime.current,
          playing: busPlaying.current,
          paused: busPaused.current,
        });
      }, 50);
      return () => {
        clearInterval(interval);
      };
    }
  }, [player]);

  // Playback progress reporting
  useEffect(() => {
    // Playback progress reporting
    const playbackInterval = setInterval(async () => {
      // Update playback progress every 20 seconds
      if (busPlaying.current && user.isLoggedIn && busTime.current > 1) {
        const currentTime = parseInt(busTime.current);
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
      clearInterval(playbackInterval);
    };
  });

  return (
    <>
      <Script src="/dist/hls.min.js" />
      <div style={{ height: "100%", maxHeight: "100%" }}>
        <div ref={vplayer} id="video-player"></div>
      </div>
    </>
  );
};

export default NewVideoPlayer;
