import { HeaderMegaMenu } from "./Navbar";
import eventBus from "../../util/eventBus";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

export default function MainLayout({ children }) {
  const [fullscreen, setFullscreen] = useState(false);
  const smallDevice = useMediaQuery("(max-width: 1000px)");
  const isSmallDevice = useRef(false);

  // Theater mode support
  useEffect(() => {
    eventBus.on("theaterMode", (data) => {
      console.log("toggling theater mode")
      setFullscreen(data);
    });
  }, []);

  useEffect(() => {
    isSmallDevice.current = smallDevice;
  }, [smallDevice]);

  return (
    <>
      {!fullscreen && <HeaderMegaMenu />}
      <main>{children}</main>
    </>
  );
}
