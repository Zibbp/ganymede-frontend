import { Center } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import QueueChatTimeline from "../../components/Queue/ChatTimeline";
import QueueHeader from "../../components/Queue/Header";
import QueueVideoTimeline from "../../components/Queue/VideoTimeline";
import QueueVodTimeline from "../../components/Queue/VodTimeline";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from "../../hooks/useApi";
import classes from "./QueueId.module.css"

const QueueItemPage = (props: any) => {

  const [intervalMs, setIntervalMs] = useState(1000);

  useDocumentTitle(`Queue ${props.queueId} - Ganymede`);

  const { error, isLoading, data } = useQuery({
    queryKey: ["queue-item", props.queueId],
    queryFn: async () => {
      const res = await useApi(
        {
          method: "GET",
          url: `/api/v1/queue/${props.queueId}`,
          withCredentials: true,
        },
        false
      );
      return res?.data;
    },
    refetchInterval: intervalMs,
  });

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <QueueHeader queue={data} />
        <div>
          <Center pt={25}>
            <QueueVodTimeline queue={data} />
          </Center>
        </div>
        <Center>
          <div className={classes.timelineBottom}>
            <div
              style={{ paddingTop: "25px" }}
              className={classes.videoTimeline}
            >
              <QueueVideoTimeline queue={data} />
            </div>
            <div style={{ paddingTop: "25px" }}>
              <QueueChatTimeline queue={data} />
            </div>
          </div>
        </Center>
      </div>
    </Authorization>
  );
};

export async function getServerSideProps(context: any) {
  const { queueId } = context.query;
  return {
    props: {
      queueId: queueId,
    },
  };
}

export default QueueItemPage;
