import { createStyles, Grid } from "@mantine/core";
import { useDocumentTitle, useFullscreen, useMediaQuery } from "@mantine/hooks";
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
  const { ref, toggle, fullscreen } = useFullscreen();
  const isSmallDevice = useRef(false);

  useDocumentTitle(`Ganymede - VOD ${props.vodId}`);

  const { data } = useQuery({
    queryKey: ["vod", props.vodId],
    queryFn: () => fetchVod(props.vodId),
  });

  const getDevice = () => {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      return true;
    } else {
      return false;
    }
  };

  // Theater mode support
  useEffect(() => {
    isSmallDevice.current = getDevice();
    eventBus.on("theaterMode", (data) => {
      setIsFullscreen(data);
      if (isSmallDevice.current) {
        try {
          toggle();
        } catch (error) {
          console.error(`Error toggling fullscreen: ${error}`);
        }
      }
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
        <div ref={ref}>
          <Grid columns={12} gutter={0}>
            <Grid.Col
              className={
                // isFullscreen is for desktop theater mode
                // fullscreen is for mobile theater mode
                // need to be seperated as desktop doesn't get toggled into fullscreen
                isFullscreen || fullscreen
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
                    isFullscreen || fullscreen
                      ? classes.videoPlayerColumnNoHeader
                      : classes.videoPlayerColumn
                  }
                  span={getDevice() ? 3 : 2}
                >
                  <VodChatPlayer vod={data} />
                </Grid.Col>
              )}
            {data.chat_path &&
              useUserStore.getState().settings.useNewChatPlayer && (
                <Grid.Col
                  className={
                    isFullscreen || fullscreen
                      ? classes.videoPlayerColumnNoHeader
                      : classes.videoPlayerColumn
                  }
                  span={getDevice() ? 3 : 2}
                >
                  <ExperimentalChatPlayer vod={data} />
                </Grid.Col>
              )}
          </Grid>
        </div>
      )}
      {!isFullscreen && <VodTitleBar vod={data} />}
    </div>
  );
};

export default VodPage;
