import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useApi } from '../../../hooks/useApi';
import GanymedeLoader from '../../../components/Utils/GanymedeLoader';
import { Text, Container, Paper, SimpleGrid, Title } from '@mantine/core';
import classes from "../Workflows.module.css"
import dayjs from 'dayjs';
import duration from "dayjs/plugin/duration";
import WorkflowEvent from '../../../components/Workflows/Event';
dayjs.extend(duration);

type Props = {}

const WorkflowInspectPage = (props: Props) => {

  const { workflowId, runId } = useParams<{ workflowId: string, runId: string }>();

  const [duration, setDuration] = useState(0)

  const { isLoading, error, data: workflowInfo } = useQuery({
    queryKey: ["workflows-closed"],
    queryFn: async () =>
      useApi(
        {
          method: "GET",
          url: `/api/v1/workflows/${workflowId}/${runId}`,
          withCredentials: true,
        },
        false
      ).then((res) => res?.data),
  });

  const { isLoading: workflowHistoryLoading, error: workflowHistoryError, data: workflowHistory } = useQuery({
    queryKey: ["workflows-closed-history"],
    queryFn: async () =>
      useApi(
        {
          method: "GET",
          url: `/api/v1/workflows/${workflowId}/${runId}/history`,
          withCredentials: true,
        },
        false
      ).then((res) => res?.data),
  });

  useEffect(() => {
    if (workflowInfo) {
      const startTime = dayjs(workflowInfo.start_time)
      const closeTime = dayjs(workflowInfo.close_time)
      const duration = closeTime.diff(startTime)
      setDuration(duration)
    }
  }, [workflowInfo])

  if (error || workflowHistoryError) return <div>Failed to load</div>;
  if (isLoading || workflowHistoryLoading) return <GanymedeLoader />;


  return (
    <div>
      <Container size="7xl">

        <div className={classes.infoBox}>

          <Title>Summary</Title>

          <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
            <div>
              <Text size="lg" fw={700}>Queue</Text>
              <Text>{workflowInfo.task_queue}</Text>
              <Text size="lg" fw={700}>Workflow Type</Text>
              <Text>{workflowInfo.type.name}</Text>
              <Text>{workflowInfo.execution.workflow_id}</Text>
            </div>
            <div>
              <Text size="lg" fw={700}>Start & Close Time</Text>
              <Text>Start Time: {dayjs(workflowInfo.start_time).format("YYYY/MM/DD HH:mm:ss")}</Text>
              <Text>Close Time: {dayjs(workflowInfo.close_time).format("YYYY/MM/DD HH:mm:ss")}</Text>
              <Text>Duration: {dayjs
                .duration(duration, "milliseconds")
                .format("HH:mm:ss")}</Text>
            </div>

          </SimpleGrid>


        </div>

        <div className={classes.infoBox}>

          <Title>Events</Title>


          {workflowHistory.map((event: any) => (
            <WorkflowEvent event={event} />
          ))}




        </div>

      </Container>

    </div>
  )
}

export default WorkflowInspectPage