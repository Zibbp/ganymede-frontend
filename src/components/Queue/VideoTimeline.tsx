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

  const openLog = (log: string) => {
    console.log(log);
    setLogName(log);
    window.open(
      `/queue/logs/${queue.id}?log=${log}`,
      "Queue Logs",
      "width=700,height=500"
    );
  };

  return (
    <div>
      <Timeline active={0} bulletSize={24} color="dark" lineWidth={3}>
        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_video_download} />}
          title="Video Download"
        >
          <Text color="dimmed" size="sm">
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

        </Timeline.Item>
      </Timeline>
    </div>
  );
};

export default QueueVideoTimeline;
