import { MediaPlayer, MediaPlayerInstance, MediaProvider, MediaProviderInstance, Poster, Track } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import getConfig from "next/config";
import { useEffect, useRef, useState } from "react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import classes from "./SyncedVideoPlayer.module.css"
import { useInterval } from "@mantine/hooks";

export type SyncedVideoPlayerProps = {
    src: string;
    vodId: string;
    title: string;
    poster: string;
    time: number;
    playing: boolean;
    muted: boolean;
    onUserSeek: (time: number) => void;
    onUserPlay: () => void;
    onUserPause: (pausedAtTime: number) => void;
    onTimeUpdate: (currentTime: number) => void;
}

const SyncedVideoPlayer = ({ src, vodId, title, poster, time, playing, muted, onUserSeek, onUserPlay, onUserPause, onTimeUpdate }: SyncedVideoPlayerProps) => {
    const { publicRuntimeConfig } = getConfig();
    const player = useRef<MediaPlayerInstance>(null)
    const mediaProvider = useRef<MediaProviderInstance>(null)
    const [canPlay, setCanPlay] = useState(false)
    const [justSynchonized, setJustSynchronized] = useState(false)

    const onPlay = () => {
        if (!player.current || playing) return;
        console.log(`vodId: ${vodId} playing`)
        onUserPlay()
    }

    const onPause = () => {
        if (!player.current || !playing) return;
        console.log(`vodId: ${vodId} pausing`)
        onUserPause(player.current.currentTime)
    }

    useEffect(() => {
        const currentPlayer = player.current
        if (!currentPlayer || !canPlay) return;
        console.log(`vodId: ${vodId} playing=${playing}`);
        (async () => {
            if (playing) {
                currentPlayer.currentTime = time;
                await (new Promise<void>(resolve => setTimeout(resolve, 1)));
                await currentPlayer.play();
            } else {
                await (new Promise<void>(resolve => setTimeout(resolve, 1)));
                await currentPlayer.pause();
            }
        })();
    }, [playing, canPlay])

    useEffect(() => {
        if (!player.current) return;
        player.current.muted = muted;
    }, [muted])

    const timeUpdateInterval = useInterval(() => {
        // Don't update if it's a rounding frame time problem
        if (!player.current || Math.abs(player.current.currentTime - time) < 0.01) return;
        onTimeUpdate(player.current.currentTime);
    }, 2000)

    useEffect(() => {
        if (!player.current) return;
        // Synchronize time if in pause or out of sync by half a second
        if (Math.abs(player.current.currentTime - time) > 0.5 || !playing) {
            player.current.currentTime = time;
            setJustSynchronized(true);
        }
        timeUpdateInterval.start();
        return timeUpdateInterval.stop;
    }, [time])

    const onSeeking = (currentTime: number) => {
        if (!player.current) return;
        setJustSynchronized((justSynchonized) => {
            if (justSynchonized) {
                return false;
            }
            onUserSeek(currentTime);
            return false;
        })
    }

    return (
        <MediaPlayer
            className={classes.mediaPlayer}
            src={src}
            ref={player}
            aspect-ratio={16 / 9}
            crossorigin
            onPlay={onPlay}
            onPause={onPause}
            onSeeking={onSeeking}
            onCanPlay={() => setCanPlay(true)}
            playsinline
        >
            <MediaProvider ref={mediaProvider}>
                <Poster className="vds-poster" src={poster} alt={title} />
                <Track
                    src={`${publicRuntimeConfig.API_URL}/api/v1/chapter/video/${vodId}/webvtt`}
                    kind="chapters"
                    default={true}
                />
            </MediaProvider>

            <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
    )
};

export default SyncedVideoPlayer;