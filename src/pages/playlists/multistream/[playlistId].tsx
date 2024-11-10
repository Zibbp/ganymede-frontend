import getConfig from "next/config";
import useUserStore from "../../../store/user";
import Head from "next/head";
import VodLoginRequired from "../../../components/Video/LoginRequred";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import GanymedeLoader from "../../../components/Utils/GanymedeLoader";
import React, { useEffect, useState } from "react";
import SyncedVideoPlayer from "../../../components/Video/SyncedVideoPlayer";
import { escapeURL } from "../../../util/util";
import classes from "./playlistMultistream.module.css"
import { ActionIcon, Drawer, Text } from "@mantine/core";
import { IconChevronUp } from "@tabler/icons-react";
import { useDisclosure, useInterval } from "@mantine/hooks";
import { MultistreamTimeline } from "../../../components/Video/MultistreamTimeline";

export async function getServerSideProps(context: any) {
  const { playlistId } = context.query;
  return {
    props: {
      playlistId,
    },
  };
}

const PlaylistMultistream = (props: { playlistId: string }) => {
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);
  const [streamerViewState, setStreamerViewState] = useState<Record<string, boolean>>({});
  const [vodPlaybackOffsets, setVodPlaybackOffsets] = useState<Record<string, number>>({});

  const checkLoginRequired = () => {
    if (
      publicRuntimeConfig.REQUIRE_LOGIN &&
      publicRuntimeConfig.REQUIRE_LOGIN == "true" &&
      !user.isLoggedIn
    ) {
      return true;
    }
    return false;
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["playlist", props.playlistId],
    queryFn: () =>
      useApi(
        {
          method: "GET",
          url: `/api/v1/playlist/${props.playlistId}?with_multistream_info=true`,
        },
        false
      ).then((res) => res?.data),
  });

  const updateVodOffset = useMutation({
    mutationKey: ["save-delay"],
    mutationFn: async ({ playlistId, vodId, delayMs }: { playlistId: string, vodId: string, delayMs: number }) => {
      await useApi(
        {
          method: "PUT",
          url: `/api/v1/playlist/${playlistId}/delay`,
          withCredentials: true,
          data: {
            vod_id: vodId,
            delay_ms: delayMs,
          }
        },
        false
      ).catch((err) => {
        console.log("Error saving delay", err);
      });
    },
  })

  const [playing, setPlaying] = useState<boolean>(false);
  const [playStartAtDate, setPlayStartAtDate] = useState<number>(0);
  const [globalTime, setGlobalTime] = useState<number>(0);
  const [globalTimeUpdate, setGlobalTimeUpdate] = useState<number>(0);
  const [startDateMs, setStartDateMs] = useState<number | null>(null);
  const [endDateMs, setEndDateMs] = useState<number | null>(null);
  const [streamers, setStreamers] = useState<Record<string, {
    name: string
    vods: Vod[]
  }>>({});

  const [opened, { open, close }] = useDisclosure(true);

  const videoCheckInterval = useInterval(() => {
    setGlobalTimeUpdate((playing ? (Date.now() - playStartAtDate) : 0) + globalTime)
  }, 1000)

  // Update start and end of the timeline
  useEffect(() => {
    if (!data) {
      return;
    }
    let _startDateMs: number | null = null;
    let _endDateMs: number | null = null;
    let _streamers: Record<string, {
      name: string
      vods: Vod[]
    }> = {};
    for (let i = 0; i < data.edges.vods.length; i++) {
      const vod = data.edges.vods[i];
      const vodStartDateMs = +new Date(vod.streamed_at)
      if (_startDateMs == null || vodStartDateMs < _startDateMs) {
        _startDateMs = vodStartDateMs;
      }
      const vodEndDateMs = vodStartDateMs + vod.duration * 1000;
      if (_endDateMs == null || _endDateMs < vodEndDateMs) {
        _endDateMs = vodEndDateMs;
      }

      if (!_streamers[vod.edges.channel.id]) {
        _streamers[vod.edges.channel.id] = {
          name: vod.edges.channel.name,
          vods: []
        }
      }

      _streamers[vod.edges.channel.id].vods.push(vod)
    }
    setStartDateMs(_startDateMs)
    setEndDateMs(_endDateMs)
    setStreamers(_streamers)

    setVodPlaybackOffsets((prevState) => {
      const newState = { ...prevState };
      if (data.edges.multistream_info) {
        for (let i = 0; i < data.edges.multistream_info.length; i++) {
          const multistreamInfo = data.edges.multistream_info[i];
          newState[multistreamInfo.edges.vod.id] = multistreamInfo.delay_ms;
        }
      }
      return newState;
    })
  }, [data])

  useEffect(() => {
    videoCheckInterval.stop()
    if (!playing) {
      return
    }
    videoCheckInterval.start();
    return videoCheckInterval.stop;
  }, [playing]);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;
  if (data.edges.vods.length === 0) return <div>Empty playlist, unable to start multistream.</div>;

  const seek = (newGlobalTime: number) => {
    setPlayStartAtDate(Date.now());
    setGlobalTime(newGlobalTime);
    setGlobalTimeUpdate(newGlobalTime);
  }

  if (startDateMs != null && globalTime < startDateMs) {
    seek(startDateMs);
  }

  const onUserPlay = () => {
    setPlayStartAtDate(Date.now());
    setPlaying(true);
  }

  const onUserPause = (pausedAtGlobalTime: number) => {
    setPlaying(false);
    setGlobalTime(pausedAtGlobalTime)
    setGlobalTimeUpdate(pausedAtGlobalTime);
  }

  const toggleView = (streamerId: string) => {
    setStreamerViewState((prevState) => {
      const newState = { ...prevState };
      newState[streamerId] = !newState[streamerId];
      return newState;
    })
  }

  const playingVodForStreamer: Record<string, Vod | null> = {};

  const playerTiles = Object.keys(streamers).map((streamerId) => {
    const streamer = streamers[streamerId];
    const playingVod = getVodAtTime(streamer.vods, vodPlaybackOffsets, globalTimeUpdate);
    playingVodForStreamer[streamerId] = playingVod;
    if (!streamerViewState[streamerId]) {
      return null;
    }
    if (!playingVod) {
      return <div className={`${classes.streamerOffline} ${classes.playerTile}`} key={streamer.name + "-no-playing-vod"}>
        <Text size="xl" span>
          {streamer.name}<br />
          <Text size="xl" fw={700} span>OFFLINE</Text>
        </Text>
      </div>
    }
    const playbackOffset = (vodPlaybackOffsets[playingVod.id] || 0) / 1000;
    const currentGlobalTime = (playing ? (Date.now() - playStartAtDate) : 0) + globalTime
    const vodTime = (currentGlobalTime - (+new Date(playingVod?.streamed_at))) / 1000 + playbackOffset;
    return (
      <div className={classes.playerTile} key={playingVod.id + "-vod-player"}>
        <SyncedVideoPlayer
          src={`${publicRuntimeConfig.CDN_URL}${escapeURL(playingVod.video_path)}`}
          vodId={playingVod.id}
          title={playingVod.title}
          poster={`${publicRuntimeConfig.CDN_URL}${escapeURL(playingVod.web_thumbnail_path)}`}
          time={vodTime}
          playing={playing}
          muted={true}
        />
      </div>
    )
  })

  return (
    <div>
      <Head>
        <title>{data.name} - Ganymede Multistream</title>
      </Head>
      {checkLoginRequired() && <VodLoginRequired {...data} /> ||
        <div className={classes.pageWrapper}>
          <div className={classes.videosGrid} style={{ '--players-count': playerTiles.reduce((acc, player) => acc + +(player != null), 0) } as React.CSSProperties}>
            {playerTiles}
          </div>
          <div className={classes.timelineOpenButtonContainer}>
            <ActionIcon
              onClick={open}
              size="sm"
              color="violet"
              variant="light"
            >
              <IconChevronUp />
            </ActionIcon>
          </div>
          <Drawer opened={opened} onClose={close} position="bottom" size="auto" overlayProps={{ backgroundOpacity: 0.1 }}>
            <MultistreamTimeline
              play={onUserPlay}
              pause={() => { onUserPause(globalTime + Date.now() - playStartAtDate) }}
              endDateMs={endDateMs}
              startDateMs={startDateMs}
              globalTime={globalTime}
              playing={playing}
              playingVodForStreamer={playingVodForStreamer}
              streamers={streamers}
              streamerViewState={streamerViewState}
              toggleView={toggleView}
              playStartAtDate={playStartAtDate}
              seek={seek}
              setVodOffset={(vodId, offset) => {
                setVodPlaybackOffsets((prevState) => {
                  const newState = { ...prevState };
                  newState[vodId] = offset;
                  return newState;
                })
                updateVodOffset.mutate({
                  playlistId: props.playlistId,
                  vodId: vodId,
                  delayMs: offset,
                })
              }}
              vodPlaybackOffsets={vodPlaybackOffsets}
            />
          </Drawer>
        </div>
      }
    </div>
  )
}

type Vod = {
  id: string
  web_thumbnail_path: string
  video_path: string
  duration: number
  streamed_at: string
  title: string
}

function getVodAtTime(vods: Vod[], vodPlaybackOffsets: Record<string, number>, time: number): Vod | null {
  for (let i = 0; i < vods.length; i++) {
    const vod = vods[i];
    const playbackOffset = (vodPlaybackOffsets[vod.id] || 0) / 1000
    const offsettedTime = time + playbackOffset;
    const vodStartDateMs = +new Date(vod.streamed_at)
    const vodEndDateMs = vodStartDateMs + vod.duration * 1000;
    if (vodStartDateMs <= offsettedTime && offsettedTime <= vodEndDateMs) {
      return vod;
    }
  }
  return null;
}

export default PlaylistMultistream;