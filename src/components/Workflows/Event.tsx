import { Code, Collapse, Group, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import React from 'react'
import classes from './Event.module.css'
import dayjs from 'dayjs'
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

type Props = {
  event: any
}

function formatDuration(nanoseconds) {
  const seconds = nanoseconds / 1e9; // Convert nanoseconds to seconds
  const duration = dayjs.duration(seconds, 'seconds');
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const remainingSeconds = duration.seconds();

  const parts = [];
  if (days > 0) {
    parts.push(`${days} days`);
  }
  if (hours > 0) {
    parts.push(`${hours} hours`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minutes`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} seconds`);
  }

  return parts.join(', ');
}

const WorkflowEvent = (props: Props) => {
  const firstAttribute = Object.keys(props.event.Attributes)[0]
  const [opened, { toggle }] = useDisclosure(false)
  const firstAttributeValue = props.event.Attributes[firstAttribute]

  return (
    <div> <div>
      <Group onClick={toggle}>
        <div className={classes.eventBar}>
          <Text fw={700} mr={15}>{props.event.event_id}</Text>

          <Text mr={15}>{dayjs(props.event.event_time).format('YYYY-MM-DD HH:mm:ss.SSS')} </Text>

          <Text mr={15}>{firstAttribute}</Text>

          <div className={classes.floatRight}>
            {
              firstAttributeValue.workflow_type && (
                <Text>
                  {firstAttributeValue.workflow_type.name}
                </Text>
              )
            }
          </div>
        </div>
      </Group>
    </div>

      <Collapse in={opened}>
        <div>

          {firstAttributeValue.task_queue && (
            <div className={classes.item}>
              <Text fw={700} mr={5}>Taskqueue:</Text>
              <Text>{firstAttributeValue.task_queue.name}</Text>
            </div>
          )}

          {firstAttributeValue.start_to_close_timeout && (
            <div className={classes.item}>
              <Text fw={700} mr={5}>Start to Close Timeout:</Text>
              <Text>{formatDuration(firstAttributeValue.start_to_close_timeout)}</Text>
            </div>
          )}

          {firstAttributeValue.heartbeat_timeout && (
            <div className={classes.item}>
              <Text fw={700} mr={5}>Heartbeat Timeout:</Text>
              <Text>{formatDuration(firstAttributeValue.heartbeat_timeout)}</Text>
            </div>
          )}

          {firstAttributeValue.retry_policy && (
            <div>
              <Text fw={800}>Retry Policy</Text>
              <div className={classes.item}>
                <Text fw={700} mr={5}>Initial Interval:</Text>
                <Text>{formatDuration(firstAttributeValue.retry_policy.initial_interval)}</Text>
              </div>
              <div className={classes.item}>
                <Text fw={700} mr={5}>Backoff Coefficient:</Text>
                <Text>{firstAttributeValue.retry_policy.backoff_coefficient}</Text>
              </div>
              <div className={classes.item}>
                <Text fw={700} mr={5}>Maximum Interval:</Text>
                <Text>{formatDuration(firstAttributeValue.retry_policy.maximum_interval)}</Text>
              </div>
              <div className={classes.item}>
                <Text fw={700} mr={5}>Maximum Attempts:</Text>
                <Text>{firstAttributeValue.retry_policy.maximum_attempts}</Text>
              </div>
            </div>
          )}




          <Text>{firstAttributeValue.input && (
            <div>
              <Text fw={700}>Input</Text>
              <Code block h={300}>{JSON.stringify(JSON.parse(atob(firstAttributeValue.input.payloads[0].data)), null, 2)}</Code>
            </div>
          )}</Text>
        </div>
      </Collapse></div>
  )
}

export default WorkflowEvent