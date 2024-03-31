import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useApi } from '../../../hooks/useApi';
import GanymedeLoader from '../../../components/Utils/GanymedeLoader';
import { Text, Container, Paper, SimpleGrid, Title, ActionIcon, Tooltip, Card } from '@mantine/core';
import classes from "../Workflows.module.css"
import dayjs from 'dayjs';
import duration from "dayjs/plugin/duration";
import WorkflowEvent from '../../../components/Workflows/Event';
import { IconRefresh } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
dayjs.extend(duration);

type Props = {}

const WorkflowInspectPage = (props: Props) => {

  const { workflowId, runId } = useParams<{ workflowId: string, runId: string }>();

  const [duration, setDuration] = useState(0)

  const [restartIconLoading, setRestartIconLoading] = useState(false)

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

  const { isLoading: workflowVideoIdLoading, error: workflowVideoIdError, data: workflowVideoId } = useQuery({
    queryKey: ["workflows-video-id"],
    queryFn: async () =>
      useApi(
        {
          method: "GET",
          url: `/api/v1/workflows/${workflowId}/${runId}/video_id`,
          withCredentials: true,
        },
        false
      ).then((res) => res?.data),
  });

  const restartArchiveWorkflow = useMutation({
    mutationFn: async (data: any) => {
      setRestartIconLoading(true)
      return useApi(
        {
          method: "POST",
          url: `/api/v1/workflows/restart`,
          withCredentials: true,
          data
        },
        false
      )
        .then(() => {
          setRestartIconLoading(false)
          showNotification({
            message: "Workflow restarted",
          })
        })
        .catch((err) => {
          setRestartIconLoading(false)
        });
    }
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


  const restartWorkflow = async () => {
    if (workflowVideoId && workflowVideoId.video_id) {
      console.log("Restarting archivve workflow")
      const data = {
        "workflow_name": workflowInfo.type.name,
        "video_id": workflowVideoId.video_id,
      }

      await restartArchiveWorkflow.mutateAsync(data)
    }
  }

  return (
    <div>
      <Container size="7xl">
        <Card withBorder p="xl" radius="md" mt={10}>

          <div className={classes.infoBox}>

            <div className={classes.header}>
              <div>
                <Title>Summary</Title>
              </div>
              <div>

              </div>
            </div>

            <div>
              <Text size="lg" fw={700}>Actions</Text>
              <div>
                <Tooltip label="Restart Workflow">
                  <ActionIcon variant="filled" color="orange" aria-label="Restart workflow" onClick={() => restartWorkflow()} loading={restartIconLoading}>
                    <IconRefresh stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </div>

            {workflowVideoId && (
              <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                <div>
                  <Text size="lg" fw={700}>Video ID</Text>
                  <Text>{workflowVideoId.video_id}</Text>
                </div>
                <div>
                  <Text size="lg" fw={700}>External Video ID</Text>
                  <Text>{workflowVideoId.external_video_id}</Text>
                </div>
              </SimpleGrid>

            )}



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
        </Card>
      </Container>

    </div>
  )
}

export default WorkflowInspectPage