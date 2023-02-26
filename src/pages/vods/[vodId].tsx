import { createStyles, Grid } from "@mantine/core";
import { useDocumentTitle, useFullscreen, useMediaQuery } from "@mantine/hooks";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { VodChatPlayer } from "../../components/Vod/ChatPlayer";
import ExperimentalChatPlayer from "../../components/Vod/ExperimentalChatPlayer";
import { VodTitleBar } from "../../components/Vod/TitleBar";
import { useApi } from "../../hooks/useApi";
import useUserStore from "../../store/user";
import Error from "next/error";
import NewVideoPlayer from "../../components/Vod/NewVideoPlayer";
import getConfig from "next/config";
import VodLoginRequired from "../../components/Vod/LoginRequred";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import eventBus from "../../util/eventBus";

const useStyles = createStyles((theme) => ({
  videoPlayerColumn: {
    width: "100%",
    height: "calc(100vh - 60px - 60px)",
    maxHeight: "calc(100vh - 60px - 60px)",
  },
  videoPlayerColumnNoHeader: {
    width: "100%",
    height: "100vh",
    maxHeight: "100vh",
  },
}));

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
  const { classes, cx, theme } = useStyles();
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullScreenHideElements, setFullScreenHideElements] = useState(false);
  // listen to media query width to determine if the chat column should be changed
  const smallDevice = useMediaQuery("(max-width: 1000px)");
  const { ref, toggle, fullscreen } = useFullscreen();
  const isSmallDevice = useRef(false);

  useDocumentTitle(`Ganymede - VOD ${props.vodId}`);

  const { data } = useQuery({
    queryKey: ["vod", props.vodId],
    queryFn: () => fetchVod(props.vodId),
  });

  // Theater mode support
  useEffect(() => {
    eventBus.on("theaterMode", (data) => {
      setIsFullscreen(data);
      if (!isSmallDevice.current) {
        setFullScreenHideElements(data);
      }
      if (isSmallDevice.current) {
        toggle();
      }
    });
  }, []);

  useEffect(() => {
    isSmallDevice.current = smallDevice;
  }, [smallDevice]);

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
        <div ref={ref}>
          <Grid columns={12} gutter={0}>
            <Grid.Col
              className={
                isFullscreen
                  ? classes.videoPlayerColumnNoHeader
                  : classes.videoPlayerColumn
              }
              span="auto"
            >
              <NewVideoPlayer vod={data} />
            </Grid.Col>
            {data.chat_video_path &&
              !useUserStore.getState().settings.useNewChatPlayer && (
                <Grid.Col
                  className={
                    isFullscreen
                      ? classes.videoPlayerColumnNoHeader
                      : classes.videoPlayerColumn
                  }
                  span={smallDevice ? 3 : 2}
                >
                  <VodChatPlayer vod={data} />
                </Grid.Col>
              )}
            {data.chat_path &&
              useUserStore.getState().settings.useNewChatPlayer && (
                <Grid.Col
                  className={
                    isFullscreen
                      ? classes.videoPlayerColumnNoHeader
                      : classes.videoPlayerColumn
                  }
                  span={smallDevice ? 3 : 2}
                >
                  <ExperimentalChatPlayer vod={data} />
                </Grid.Col>
              )}
          </Grid>
        </div>
      )}
      {!fullScreenHideElements && <VodTitleBar vod={data} />}
    </div>
  );
};

export default VodPage;
