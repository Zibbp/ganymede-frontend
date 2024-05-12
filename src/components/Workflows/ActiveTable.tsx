import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useApi } from '../../hooks/useApi';
import GanymedeLoader from '../Utils/GanymedeLoader';
import { Box, Button, Table } from '@mantine/core';
import WorkflowStatusCompleted from './Status/Completed';
import WorkflowStatusRunning from './Status/Running';
import dayjs from 'dayjs';
import WorkflowStatusCancelled from './Status/Cancelled';
import WorkflowStatusTerminated from './Status/Terminated';
import Link from 'next/link';
import WorkflowStatusFailed from './Status/Failed';

type Props = {}

async function fetchActiveWorkflows(nextPageToken: string) {
  return useApi(
    {
      method: "GET",
      url: `/api/v1/workflows/active?next_page_token=${nextPageToken}`,
      withCredentials: true,
    },
    false
  ).then((res) => res?.data);
}

const WorkflowsActiveTable = (props: Props) => {
  const [nextPageToken, setNextPageToken] = React.useState<string>("");
  const [executions, setExecutions] = React.useState<any>([])

  const { isLoading, error, data } = useQuery({
    queryKey: ["workflows-active", nextPageToken],
    queryFn: async () => {
      const data = await fetchActiveWorkflows(nextPageToken)
      // append data.executions to executions
      if (data.executions) {
        setExecutions([...executions, ...data.executions])
      }

      return data
    },
  });

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  if (!executions) return <div>No data</div>

  const handleNextPage = (nextPageToken: string) => {
    setNextPageToken(nextPageToken)
  }

  const rows = executions.map((workflow: any) => (
    <Table.Tr key={workflow.execution.run_id}>
      <Table.Td>
        {workflow.status == 1 && <WorkflowStatusRunning />}
        {workflow.status == 2 && <WorkflowStatusCompleted />}
        {workflow.status == 3 && <WorkflowStatusFailed />}
        {workflow.status == 4 && <WorkflowStatusCancelled />}
        {workflow.status == 5 && <WorkflowStatusTerminated />}
      </Table.Td>
      <Table.Td>
        <Link href={`/workflows/${workflow.execution.workflow_id}/${workflow.execution.run_id}`}>
          <span>
            {workflow.execution.workflow_id}
          </span>
        </Link>
      </Table.Td>
      <Table.Td>
        <Link href={`/workflows/${workflow.execution.workflow_id}/${workflow.execution.run_id}`}>
          <span>
            {workflow.execution.run_id}
          </span>
        </Link>
      </Table.Td>
      <Table.Td>
        <Link href={`/workflows/${workflow.execution.workflow_id}/${workflow.execution.run_id}`}>
          <span>
            {workflow.type.name}
          </span>
        </Link>
      </Table.Td>
      <Table.Td>{dayjs.unix(workflow.start_time.seconds).format("YYYY/MM/DD HH:mm:ss")}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Box pb={10}>
      <Table highlightOnHover >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Status</Table.Th>
            <Table.Th>Workflow ID</Table.Th>
            <Table.Th>Run ID</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Start Time</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      {data.next_page_token && (
        <Button fullWidth variant="light" color="violet" onClick={() => handleNextPage(data.next_page_token)}>Load More</Button>
      )}
    </Box>
  )
}

export default WorkflowsActiveTable