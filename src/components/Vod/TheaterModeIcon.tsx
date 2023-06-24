import { ActionIcon, Tooltip, createStyles } from "@mantine/core";
import { IconMaximize } from "@tabler/icons";
import React, { useRef } from "react";
import eventBus from "../../util/eventBus";

const useStyles = createStyles((theme) => ({
  customFullScreenButton: {
    color: "#f5f5f5",
    ":hover": {
      color: "#f5f5f5",
      backgroundColor: "rgb(255 255 255 / 0.2)",
    },
  },
}));

const TheaterModeIcon = () => {
  const { classes, cx, theme } = useStyles();
  const isFullscreen = useRef(false);

  const toggleTheaterMode = () => {
    isFullscreen.current = !isFullscreen.current;
    eventBus.emit("theaterMode", isFullscreen.current);
    console.log("Emitted: ", isFullscreen.current);
  };
  return (
    <div>
      <Tooltip label="Theater Mode" position="bottom">
        <ActionIcon
          size="xl"
          variant="transparent"
          onClick={toggleTheaterMode}
          className={classes.customFullScreenButton}
        >
          <IconMaximize size="1.8rem" />
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

export default TheaterModeIcon;
