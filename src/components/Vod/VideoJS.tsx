import { useFullscreen } from "@mantine/hooks";
import React, { useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hotkeys";
import eventBus from "../../util/eventBus";

export const VideoJS = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady } = props;
  const { toggle, fullscreen } = useFullscreen();
  const isFullscreen = useRef(false);

  const setTheaterMode = () => {
    isFullscreen.current = !isFullscreen.current;
    eventBus.emit("theaterMode", isFullscreen.current);
    console.log("Emitted: ", isFullscreen.current);

    // toggle();
  };

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      }));

      var theaterButton = player.controlBar.addChild("button", {}, 100);
      var theaterButtonDom = theaterButton.el();
      theaterButton.addClass("vjs-icon-square");
      theaterButton.controlText("Theater Mode");
      theaterButtonDom.onclick = function () {
        setTheaterMode();
      };
      theaterButtonDom.addEventListener("touchstart", setTheaterMode);

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player style={{ height: "100%", width: "100%" }}>
      <div ref={videoRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default VideoJS;
