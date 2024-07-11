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

const QueueChatTimeline = ({ queue }: Object) => {
  const [logName, setLogName] = useState("");

  // modal
  const [opened, setOpened] = useState(false);
  const [restartTaskName, setRestartTaskName] = useState("");

  const openLog = (log: string) => {
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
            {!queue.live_archive && (
              <span>
                <span
                  className={classes.restartText}
                  onClick={() => restartTask("task_chat_download")}
                >
                  restart
                </span>
                <span> - </span>
              </span>
            )}
            <span
              className={classes.restartText}
              onClick={() => openLog("chat")}
            >
              logs
            </span>
          </Text>
        </Timeline.Item>

        {queue.live_archive && (
          <Timeline.Item
            bullet={<QueueTimelineBullet status={queue.task_chat_convert} />}
            title="Chat Convert"
          >
            <Text color="dimmed" size="sm">
              <span>
                <span
                  className={classes.restartText}
                  onClick={() => restartTask("task_chat_convert")}
                >
                  restart
                </span>
                <span> - </span>
              </span>
              <span
                className={classes.restartText}
                onClick={() => openLog("chat-convert")}
              >
                logs
              </span>
            </Text>
          </Timeline.Item>
        )}

        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_chat_render} />}
          title="Chat Render"
        >
          <Text color="dimmed" size="sm">
            <span>
              <span
                className={classes.restartText}
                onClick={() => restartTask("task_chat_render")}
              >
                restart
              </span>
              <span> - </span>
            </span>
            <span
              className={classes.restartText}
              onClick={() => openLog("chat-render")}
            >
              logs
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
              onClick={() => restartTask("task_chat_move")}
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

export default QueueChatTimeline;
