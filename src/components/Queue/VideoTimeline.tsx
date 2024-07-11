import { Timeline, Text, Modal } from "@mantine/core";
import {
  IconGitBranch,
  IconGitPullRequest,
  IconGitCommit,
  IconMessageDots,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QueueRestartTaskModalContent from "./RestartTaskModal";
import QueueTimelineBullet from "./TimelineBullet";
import classes from "./Timeline.module.css"

const QueueVideoTimeline = ({ queue }: Object) => {
  const [logName, setLogName] = useState("");

  // modal
  const [opened, setOpened] = useState(false);
  const [restartTaskName, setRestartTaskName] = useState("");

  const openLog = (log: string) => {
    console.log(log);
    setLogName(log);
    window.open(
      `/queue/logs/${queue.id}?log=${log}`,
      "Queue Logs",
      "width=700,height=500"
    );
  };

  const restartTask = (task: string) => {
    console.log(task);
    setRestartTaskName(task);
    setOpened(true);
  };



  return (
    <div>
      <Timeline active={0} bulletSize={24} color="dark" lineWidth={3}>
        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_video_download} />}
          title="Video Download"
        >
          <Text color="dimmed" size="sm">
            {!queue.live_archive && (
              <span>
                <span
                  className={classes.restartText}
                  onClick={() => restartTask("task_video_download")}
                >
                  restart
                </span>
                <span> - </span>
              </span>
            )}
            <span
              className={classes.restartText}
              onClick={() => openLog("video")}
            >
              logs
            </span>
          </Text>
        </Timeline.Item>

        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_video_convert} />}
          title="Video Convert"
        >
          <Text color="dimmed" size="sm">
            <span
              className={classes.restartText}
              onClick={() => restartTask("task_video_convert")}
            >
              restart
            </span>
            <span> - </span>
            <span
              className={classes.restartText}
              onClick={() => openLog("video-convert")}
            >
              logs
            </span>
          </Text>
        </Timeline.Item>

        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_video_move} />}
          title="Video Move"
        >
          <Text color="dimmed" size="sm">
            <span
              className={classes.restartText}
              onClick={() => restartTask("task_video_move")}
            >
              restart
            </span>
          </Text>
        </Timeline.Item>
      </Timeline>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Restart Queue Task"
      >
        <QueueRestartTaskModalContent queue={queue} task={restartTaskName} />
      </Modal>
    </div>
  );
};

export default QueueVideoTimeline;
