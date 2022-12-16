import { Timeline, Text, Modal, createStyles } from "@mantine/core";
import {
  IconGitBranch,
  IconGitPullRequest,
  IconGitCommit,
  IconMessageDots,
} from "@tabler/icons";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QueueLog from "./Log";
import QueueRestartTaskModalContent from "./RestartTaskModal";
import QueueTimelineBullet from "./TimelineBullet";

const useStyles = createStyles((theme) => ({
  restartText: {
    cursor: "pointer",
  },
}));

const QueueChatTimeline = ({ queue }: Object) => {
  const { classes, cx, theme } = useStyles();
  const [opened, setOpened] = useState(false);
  const [restartTaskName, setRestartTaskName] = useState("");
  const [logName, setLogName] = useState("");

  const restartTask = (task: string) => {
    console.log(task);
    setRestartTaskName(task);
    setOpened(true);
  };

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
      <Timeline
        active={0}
        bulletSize={24}
        color="dark"
        align="right"
        lineWidth={3}
      >
        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_chat_download} />}
          title="Chat Download"
        >
          <Text color="dimmed" size="sm">
            <span
              className={classes.restartText}
              onClick={() => openLog("chat")}
            >
              logs
            </span>
            <span>{" - "}</span>
            <span
              className={classes.restartText}
              onClick={() => restartTask("chat_download")}
            >
              restart
            </span>
          </Text>
        </Timeline.Item>

        {queue.live_archive && (
          <Timeline.Item
            bullet={<QueueTimelineBullet status={queue.task_chat_convert} />}
            title="Chat Convert"
          >
            <Text color="dimmed" size="sm">
              <span
                className={classes.restartText}
                onClick={() => openLog("chat-convert")}
              >
                logs
              </span>
              <span>{" - "}</span>
              <span
                className={classes.restartText}
                onClick={() => restartTask("chat_convert")}
              >
                restart
              </span>
            </Text>
          </Timeline.Item>
        )}

        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_chat_render} />}
          title="Chat Render"
        >
          <Text color="dimmed" size="sm">
            <span
              className={classes.restartText}
              onClick={() => openLog("chat-render")}
            >
              logs
            </span>
            <span>{" - "}</span>
            <span
              className={classes.restartText}
              onClick={() => restartTask("chat_render")}
            >
              restart
            </span>
          </Text>
        </Timeline.Item>

        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_chat_move} />}
          title="Chat Move"
        >
          <Text color="dimmed" size="sm">
            <span
              className={classes.restartText}
              onClick={() => restartTask("chat_move")}
            >
              restart
            </span>
          </Text>
        </Timeline.Item>
      </Timeline>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Restart Task"
      >
        <QueueRestartTaskModalContent queue={queue} task={restartTaskName} />
      </Modal>
    </div>
  );
};

export default QueueChatTimeline;
