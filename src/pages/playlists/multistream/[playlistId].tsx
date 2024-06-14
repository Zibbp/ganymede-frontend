import getConfig from "next/config";
import useUserStore from "../../../store/user";
import Head from "next/head";
import VodLoginRequired from "../../../components/Vod/LoginRequred";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import GanymedeLoader from "../../../components/Utils/GanymedeLoader";
import React, { Fragment, useEffect, useState } from "react";
import SyncedVideoPlayer from "../../../components/Vod/SyncedVideoPlayer";
import { escapeURL } from "../../../util/util";
import classes from "./playlistMultistream.module.css"
import { ActionIcon, Flex, NumberInput, Text } from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

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
    const [globalTime, setGlobalTime] = useState<number>(0);
    const [seeked, setSeeked] = useState<boolean>(false);
    const [startDateMs, setStartDateMs] = useState<number | null>(null);
    const [endDateMs, setEndDateMs] = useState<number | null>(null);
    const [streamers, setStreamers] = useState<Record<string, {
        name: string
        vods: Vod[]
    }>>({});

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

    if (error) return <div>failed to load</div>;
    if (isLoading) return <GanymedeLoader />;
    if (data.edges.vods.length === 0) return <div>Empty playlist, unable to start multistream.</div>;

    let timelineDurationMs: number = startDateMs != null && endDateMs != null ? endDateMs - startDateMs : 0;
    if (seeked)
        setSeeked(false);

    const seek = (newGlobalTime: number) => {
        setSeeked(true);
        setGlobalTime(newGlobalTime);
    }

    if (startDateMs != null && globalTime < startDateMs) {
        seek(startDateMs);
    }

    const onUserPlay = () => {
        setPlaying(true);
    }

    const onUserPause = (pausedAtGlobalTime: number) => {
        setPlaying(false);
        setGlobalTime(pausedAtGlobalTime)
    }

    const onUserSeek = (time: number) => {
        seek(time);
    }

    const onTimeUpdate = (currentTime: number) => {
        setGlobalTime(currentTime);
    }

    const timeAtMousePosition = (timelineBar: HTMLDivElement | null, event: React.MouseEvent) => {
        if (!timelineBar) return null;
        const rect = timelineBar.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percentage = x / rect.width;
        const globalTime = startDateMs! + percentage * timelineDurationMs;
        return globalTime;
    }

    const onTimelineClick = (timelineBar: HTMLDivElement | null, event: React.MouseEvent) => {
        const newGlobalTime = timeAtMousePosition(timelineBar, event);
        if (newGlobalTime == null) {
            return;
        }
        seek(newGlobalTime);
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
        const playingVod = getVodAtTime(streamer.vods, vodPlaybackOffsets, globalTime);
        playingVodForStreamer[streamerId] = playingVod;
        if (!streamerViewState[streamerId]) {
            return null;
        }
        if (!playingVod) {
            return <div className={`${classes.streamerOffline} ${classes.playerTile}`} key={streamer.name + "-no-playing-vod"}>
                <Text size="xl" span>
                    { streamer.name }<br />
                    <Text size="xl" fw={700} span>OFFLINE</Text>
                </Text>
            </div>
        }
        const playbackOffset = (vodPlaybackOffsets[playingVod.id] || 0) / 1000;
        const vodTime = (globalTime - (+new Date(playingVod?.streamed_at))) / 1000 + playbackOffset;
        const toGlobalTime = (time: number) => (time - playbackOffset) * 1000 + (+new Date(playingVod.streamed_at));
        return (
            <div className={classes.playerTile} key={playingVod.id + "-vod-player"}>
                <SyncedVideoPlayer
                    src={`${publicRuntimeConfig.CDN_URL}${escapeURL(playingVod.video_path)}`}
                    vodId={playingVod.id}
                    title={playingVod.title}
                    poster={`${publicRuntimeConfig.CDN_URL}${escapeURL(playingVod.video_path)}`}
                    time={vodTime}
                    playing={playing}
                    muted={true}
                    onUserSeek={(time) => onUserSeek(toGlobalTime(time))}
                    onUserPlay={onUserPlay}
                    onUserPause={(pausedAtTime) => onUserPause(toGlobalTime(pausedAtTime))}
                    onTimeUpdate={(currentTime) => onTimeUpdate(toGlobalTime(currentTime))}
                />
            </div>
        )
    })

    return (
        <div>
            <Head>
                <title>{data.name} - Ganymede</title>
            </Head>
            { checkLoginRequired() && <VodLoginRequired {...data} /> ||
                <div className={classes.pageWrapper}>
                    <div className={classes.videosGrid} style={{ '--players-count': playerTiles.reduce((acc, player) => acc + +(player != null), 0) } as React.CSSProperties}>
                        { playerTiles }
                    </div>
                    {
                        startDateMs != null && endDateMs != null && <div className={classes.timelineGrid}>
                            { Object.keys(streamers).map((streamerId) => {
                                const streamer = streamers[streamerId]

                                const timelineBar = <div className={classes.timelineBar}>
                                    { streamer.vods.map(vod => <div key={vod.id + "-vod-timeline-online"} className={classes.timelineBarActive} style={{
                                        '--bar-start': `${100 * (+new Date(vod.streamed_at) - startDateMs!) / timelineDurationMs}%`,
                                        '--bar-length': `${100 * 1000 * vod.duration / timelineDurationMs}%`,
                                    } as React.CSSProperties}></div>) }
                                </div>

                                const playingVod = playingVodForStreamer[streamerId];

                                return (
                                    <Fragment key={streamer.name + "-timeline-row"}>
                                        <div className={classes.timelineStreamerColumn}>
                                            { streamer.name }
                                            <ActionIcon variant="transparent" onClick={() => toggleView(streamerId)}>
                                                { streamerViewState[streamerId] ? <IconEye size="1.125rem" /> : <IconEyeOff size="1.125rem" /> }
                                            </ActionIcon>
                                            <NumberInput
                                                className={classes.offsetInput}
                                                size="xs"
                                                step={0.1}
                                                value={playingVod && vodPlaybackOffsets[playingVod.id] != null ? (vodPlaybackOffsets[playingVod.id] || 0) / 1000 : ''}
                                                placeholder="Offset"
                                                disabled={!playingVod}
                                                onChange={(value) => {
                                                    if (!playingVod) return;
                                                    const valAsNumber = Math.trunc(+value * 1000);
                                                    if (isNaN(valAsNumber)) return;
                                                    setVodPlaybackOffsets((prevState) => {
                                                        const newState = { ...prevState };
                                                        newState[playingVod.id] = valAsNumber;
                                                        return newState;
                                                    })
                                                    updateVodOffset.mutate({
                                                        playlistId: props.playlistId,
                                                        vodId: playingVod.id,
                                                        delayMs: valAsNumber,
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div>{ timelineBar }</div>
                                    </Fragment>
                                )
                            })}

                            {
                                (() => {
                                    let timelineBarRef: HTMLDivElement | null = null;

                                    return (<div className={classes.playheadContainer} ref={el => timelineBarRef = el} onClick={(event) => onTimelineClick(timelineBarRef, event)}>
                                        <div className={classes.playhead} style={{ '--playhead-position': `${((globalTime - startDateMs) / timelineDurationMs) * 100}%` }as React.CSSProperties}></div>
                                    </div>)
                                })()
                            }
                        </div>
                    }
                </div>
            }
        </div>
    )
}

type Vod = {
    id: string
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