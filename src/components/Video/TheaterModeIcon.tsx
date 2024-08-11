import { ActionIcon, Tooltip } from "@mantine/core";
import { IconMaximize } from "@tabler/icons-react";
import React, { useRef } from "react";
import eventBus from "../../util/eventBus";
import classes from "./TheaterModeIcon.module.css";

const TheaterModeIcon = () => {
  const isFullscreen = useRef(false);

  const toggleTheaterMode = () => {
    isFullscreen.current = !isFullscreen.current;
    eventBus.emit("theaterMode", isFullscreen.current);
    console.log("Emitted: ", isFullscreen.current);
  };
  return (
    <div className={classes.theaterIcon}>
      <Tooltip label="Theater Mode" position="bottom">
        <ActionIcon
          size="xl"
          variant="transparent"
          onClick={toggleTheaterMode}
          onTouchStart={toggleTheaterMode}
          className={classes.customFullScreenButton}
        >
          <IconMaximize size="1.7rem" />
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

export default TheaterModeIcon;
