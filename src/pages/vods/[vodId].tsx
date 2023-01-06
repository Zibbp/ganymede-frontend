import { createStyles, Grid } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { VodChatPlayer } from "../../components/Vod/ChatPlayer";
import ExperimentalChatPlayer from "../../components/Vod/ExperimentalChatPlayer";
import { VodTitleBar } from "../../components/Vod/TitleBar";
import { VodVideoPlayer } from "../../components/Vod/VideoPlayer";
import { useApi } from "../../hooks/useApi";
import useUserStore from "../../store/user";
import Error from "next/error";
import dynamic from "next/dynamic";
import NewVideoPlayer from "../../components/Vod/NewVideoPlayer";

const useStyles = createStyles((theme) => ({
  videoPlayerColumn: {
    width: "100%",
    height: "calc(100vh - 60px - 60px)",
    maxHeight: "calc(100vh - 60px - 60px)",
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

  useDocumentTitle(`Ganymede - VOD ${props.vodId}`);

  const { data } = useQuery({
    queryKey: ["vod", props.vodId],
    queryFn: () => fetchVod(props.vodId),
  });

  if (!data) {
    return <Error statusCode={404} />;
  }

  return (
    <div>
      <Grid columns={12} gutter={0}>
        <Grid.Col className={classes.videoPlayerColumn} span="auto">
          {/* <VodVideoPlayer vod={data} /> */}
          <NewVideoPlayer vod={data} />
        </Grid.Col>
        {data.chat_video_path &&
          !useUserStore.getState().settings.useNewChatPlayer && (
            <Grid.Col className={classes.videoPlayerColumn} span={2}>
              <VodChatPlayer vod={data} />
            </Grid.Col>
          )}
        {data.chat_path &&
          useUserStore.getState().settings.useNewChatPlayer && (
            <Grid.Col className={classes.videoPlayerColumn} span={2}>
              <ExperimentalChatPlayer vod={data} />
            </Grid.Col>
          )}
      </Grid>
      <VodTitleBar vod={data} />
    </div>
  );
};

export default VodPage;
