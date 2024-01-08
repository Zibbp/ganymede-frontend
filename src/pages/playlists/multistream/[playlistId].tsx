import getConfig from "next/config";
import useUserStore from "../../../store/user";
import Head from "next/head";
import VodLoginRequired from "../../../components/Vod/LoginRequred";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import GanymedeLoader from "../../../components/Utils/GanymedeLoader";
import React, { Fragment, useState } from "react";
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
    const [streamerPlaybackOffsets, setStreamerPlaybackOffsets] = useState<Record<string, number>>({});

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
            url: `/api/v1/playlist/${props.playlistId}`,
          },
          false
        ).then((res) => res?.data),
    });

    const [playing, setPlaying] = useState<boolean>(false);
    const [globalTime, setGlobalTime] = useState<number>(0);
    const [seeked, setSeeked] = useState<boolean>(false);

    if (error) return <div>failed to load</div>;
    if (isLoading) return <GanymedeLoader />;
    if (data.edges.vods.length === 0) return <div>Empty playlist, unable to start multistream.</div>;

    let startDateMs: number | null = null;
    let endDateMs: number | null = null;
    const streamers: Record<string, {
        name: string
        vods: Vod[]
    }> = {}

    for (let i = 0; i < data.edges.vods.length; i++) {
        const vod = data.edges.vods[i];
        const vodStartDateMs = +new Date(vod.streamed_at)
        if (startDateMs == null || vodStartDateMs < startDateMs) {
            startDateMs = vodStartDateMs;
        }
        const vodEndDateMs = vodStartDateMs + vod.duration * 1000;
        if (endDateMs == null || endDateMs < vodEndDateMs) {
            endDateMs = vodEndDateMs;
        }

        if (!streamers[vod.edges.channel.id]) {
            streamers[vod.edges.channel.id] = {
                name: vod.edges.channel.name,
                vods: []
            }
        }

        streamers[vod.edges.channel.id].vods.push(vod)
    }
    let timelineDurationMs: number = startDateMs != null && endDateMs != null ? endDateMs - startDateMs : 0;
    let _seeked = false;
    if (seeked)
        setSeeked(false);

    const seek = (newGlobalTime: number) => {
        _seeked = true;
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

    const onTimelineClick = (timelineBar: HTMLDivElement | null, event: React.MouseEvent) => {
        if (!timelineBar) return;
        const rect = timelineBar.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percentage = x / rect.width;
        const newGlobalTime = startDateMs! + percentage * timelineDurationMs;
        seek(newGlobalTime);
    }

    const toggleView = (streamerId: string) => {
        setStreamerViewState((prevState) => {
            const newState = { ...prevState };
            newState[streamerId] = !newState[streamerId];
            return newState;
        })
    }

    const playerTiles = Object.keys(streamers).map((streamerId) => {
        if (!streamerViewState[streamerId]) {
            return null;
        }
        const streamer = streamers[streamerId];
        const playbackOffset = (streamerPlaybackOffsets[streamerId] || 0) / 1000;
        const playingVod = getVodAtTime(streamer.vods, globalTime + playbackOffset);
        if (!playingVod) {
            return <div className={`${classes.streamerOffline} ${classes.playerTile}`} key={streamer.name + "-no-playing-vod"}>
                <Text size="xl" span>
                    { streamer.name }<br />
                    <Text size="xl" fw={700} span>OFFLINE</Text>
                </Text>
            </div>
        }
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

                                let timelineBarRef: HTMLDivElement | null = null;

                                const timelineBar = <div className={classes.timelineBar} ref={el => timelineBarRef = el} onClick={(event) => onTimelineClick(timelineBarRef, event)}>
                                    { streamer.vods.map(vod => <div key={vod.id + "-vod-timeline-online"} className={classes.timelineBarActive} style={{
                                        '--bar-start': `${100 * (+new Date(vod.streamed_at) - startDateMs!) / timelineDurationMs}%`,
                                        '--bar-length': `${100 * 1000 * vod.duration / timelineDurationMs}%`,
                                    } as React.CSSProperties}></div>) }
                                </div>

                                return (
                                    <Fragment key={streamer.name + "-timeline-row"}>
                                        <div className={classes.timelineStreamerColumn}>
                                            { streamer.name }
                                            <ActionIcon variant="transparent" onClick={() => toggleView(streamerId)}>
                                                { streamerViewState[streamerId] ? <IconEye size="1.125rem" /> : <IconEyeOff size="1.125rem" /> }
                                            </ActionIcon>
                                            <NumberInput
                                                className={classes.offsetInput}
                                                step={0.1}
                                                value={(streamerPlaybackOffsets[streamerId] || 0) / 1000}
                                                placeholder="Offset"
                                                onChange={(value) => {
                                                    const valAsNumber = +value * 1000;
                                                    if (isNaN(valAsNumber)) return;
                                                    setStreamerPlaybackOffsets((prevState) => {
                                                        const newState = { ...prevState };
                                                        newState[streamerId] = valAsNumber;
                                                        return newState;
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div>{ timelineBar }</div>
                                    </Fragment>
                                )
                            })}
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

function getVodAtTime(vods: Vod[], time: number): Vod | null {
    for (let i = 0; i < vods.length; i++) {
        const vod = vods[i];
        const vodStartDateMs = +new Date(vod.streamed_at)
        const vodEndDateMs = vodStartDateMs + vod.duration * 1000;
        if (vodStartDateMs <= time && time <= vodEndDateMs) {
            return vod;
        }
    }
    return null;
}

export default PlaylistMultistream;