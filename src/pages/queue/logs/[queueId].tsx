import { createStyles } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import GanymedeLoader from "../../../components/Utils/GanymedeLoader";
import { useApi } from "../../../hooks/useApi";

const useStyles = createStyles((theme) => ({
  logPage: {
    backgroundColor: "black",
    color: "white",
    height: "calc(100vh - 60px)",
    maxHeight: "calc(100vh - 60px)",
    overflowY: "scroll",
  },
  logLine: {
    whiteSpace: "pre-line",
  },
}));

const QueueLogsPage = (props: any) => {
  const { classes, cx, theme } = useStyles();
  const [intervalMs, setIntervalMs] = useState(1000);
  const logEndRef = useRef(null);

  useDocumentTitle("Ganymede - Logs");

  const { error, isLoading, data } = useQuery(
    ["queue-item", props.queueId],
    async () => {
      const res = await useApi(
        {
          method: "GET",
          url: `/api/v1/queue/${props.queueId}/tail?type=${props.log}`,
          withCredentials: true,
        },
        false
      );
      return { __html: res?.data };
    },
    {
      refetchInterval: intervalMs,
    }
  );

  useEffect(() => {
    const logScrollInterval = setInterval(() => {
      if (logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 1000);
    return () => clearInterval(logScrollInterval);
  });

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div className={classes.logPage}>
      <div className={classes.logLine} dangerouslySetInnerHTML={data}></div>
      <div ref={logEndRef} />
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { queueId } = context.query;
  const { log } = context.query;
  return {
    props: {
      queueId: queueId,
      log: log,
    },
  };
}

export default QueueLogsPage;
