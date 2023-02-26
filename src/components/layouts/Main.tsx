import { HeaderMenu } from "./Navbar";
import eventBus from "../../util/eventBus";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

export default function MainLayout({ children }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [fullScreenHideElements, setFullScreenHideElements] = useState(false);
  const smallDevice = useMediaQuery("(max-width: 1000px)");
  const isSmallDevice = useRef(false);

  // Theater mode support
  useEffect(() => {
    eventBus.on("theaterMode", (data) => {
      setFullscreen(data);
      if (!isSmallDevice.current) {
        setFullScreenHideElements(data);
      }
    });
  }, []);

  useEffect(() => {
    isSmallDevice.current = smallDevice;
  }, [smallDevice]);

  return (
    <>
      {!fullScreenHideElements && <HeaderMenu />}
      <main>{children}</main>
    </>
  );
}
