import { Box, Grid, em } from "@mantine/core";
import { useDocumentTitle, useFullscreen, useInterval, useMediaQuery } from "@mantine/hooks";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { VodChatPlayer } from "../../components/Vod/ChatPlayer";
import ExperimentalChatPlayer from "../../components/Vod/ExperimentalChatPlayer";
import { VodTitleBar } from "../../components/Vod/TitleBar";
import { useApi } from "../../hooks/useApi";
import useUserStore from "../../store/user";
import Error from "next/error";
import NewVideoPlayer from "../../components/Vod/VideoPlayer";
import getConfig from "next/config";
import VodLoginRequired from "../../components/Vod/LoginRequred";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import eventBus from "../../util/eventBus";
import classes from "./vodId.module.css"

async function fetchVod(vodId: string) {
  return useApi(
    { method: "GET", url: `/api/v1/vod/${vodId}?with_channel=true` },
    false
  ).then((res) => res?.data);
}

export async function getServerSideProps(context: any) {
  const { vodId } = context.query;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["vod", vodId], () => fetchVod(vodId));

  return {
    props: {
      vodId: vodId,
      dehydratedState: dehydrate(queryClient),
    },
  };
}

const VodPage = (props: any) => {
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { ref, toggle, fullscreen } = useFullscreen();
  const isSmallDevice = useRef(false);

  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const liveChatPlayer = useRef<HTMLDivElement>(null);

  const [leftColumnHeight, setLeftColumnHeight] = useState(0);
  const isMobile = useMediaQuery(`(max-width: ${em(1000)})`);


  // Mobile screen / devices smaller than 1000px
  // Calculate the height of the left column
  // and set the height of the right column to the remaining height
  // which is 100vh - 120px - leftColumnHeight
  const handleResize = () => {
    if (isMobile && leftColumnRef.current) {
      setLeftColumnHeight(leftColumnRef.current.offsetHeight);
    }
  };
  useEffect(() => {
    if (!isMobile) {
      return
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    // set 1 second interval to check if the user is on a mobile device
    const interval = setInterval(() => {
      if (rightColumnRef.current?.offsetHeight == 0) {
        handleResize();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };

  }, [leftColumnRef, rightColumnRef, isMobile])


  useDocumentTitle(`Ganymede - VOD ${props.vodId}`);

  const { data } = useQuery({
    queryKey: ["vod", props.vodId],
    queryFn: () => fetchVod(props.vodId),
  });





  // Theater mode support
  useEffect(() => {
    eventBus.on("theaterMode", (data) => {
      setIsFullscreen(data);
      // if (isMobile) {
      //   try {
      //     toggle();
      //   } catch (error) {
      //     console.error(`Error toggling fullscreen: ${error}`);
      //   }
      // }
    });
  }, []);

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

  if (!data) {
    return <Error statusCode={404} />;
  }

  return (
    <div>
      <Head>
        <title>{data.title} - Ganymede</title>
      </Head>
      {checkLoginRequired() && <VodLoginRequired {...data} />}
      {!checkLoginRequired() && (
        <Box className={classes.container} >
          <div className={classes.leftColumn} ref={leftColumnRef}>
            <div
              className={
                // isFullscreen is for desktop theater mode
                // fullscreen is for mobile theater mode
                // need to be seperated as desktop doesn't get toggled into fullscreen
                isFullscreen || fullscreen
                  ? classes.videoPlayerColumnNoHeader
                  : classes.videoPlayerColumn
              }>
              <NewVideoPlayer vod={data} />
            </div>
          </div>
          <div className={classes.rightColumn} style={{ height: isMobile ? `calc(100vh - 120px - ${leftColumnHeight}px)` : 'auto', maxHeight: isMobile ? `calc(100vh - 120px - ${leftColumnHeight}px)` : 'auto' }}>

            {data.chat_video_path &&
              !useUserStore.getState().settings.useNewChatPlayer && (
                <div>
                  {isMobile ? (
                    <div
                      ref={rightColumnRef}
                      style={{
                        height: `calc(100vh - 120px - ${leftColumnHeight}px)`,
                        maxHeight: `calc(100vh - 120px - ${leftColumnHeight}px)`
                      }}

                    >
                      <VodChatPlayer ref={liveChatPlayer} vod={data} />
                    </div>
                  ) : (
                    <div
                      ref={rightColumnRef}
                      className={
                        isFullscreen || fullscreen
                          ? classes.chatColumnNoHeader
                          : classes.chatColumn
                      }
                    >
                      <VodChatPlayer vod={data} />
                    </div>
                  )}
                </div>

              )}
            {data.chat_path &&
              useUserStore.getState().settings.useNewChatPlayer && (
                <div>
                  {isMobile ? (
                    <div
                      ref={rightColumnRef}
                      style={{
                        height: `calc(100vh - 120px - ${leftColumnHeight}px)`,
                        maxHeight: `calc(100vh - 120px - ${leftColumnHeight}px)`
                      }}

                    >
                      <ExperimentalChatPlayer ref={liveChatPlayer} vod={data} />
                    </div>
                  ) : (
                    <div
                      ref={rightColumnRef}
                      className={
                        isFullscreen || fullscreen
                          ? classes.chatColumnNoHeader
                          : classes.chatColumn
                      }
                    >
                      <ExperimentalChatPlayer vod={data} />
                    </div>
                  )}
                </div>
              )}

          </div>

        </Box>
      )}
      {!isFullscreen && <VodTitleBar vod={data} />}
    </div>
  );
};

export default VodPage;
