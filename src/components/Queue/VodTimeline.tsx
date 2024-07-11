import { Timeline, Text, Modal } from "@mantine/core";
import {
  IconGitBranch,
  IconGitPullRequest,
  IconGitCommit,
  IconMessageDots,
} from "@tabler/icons-react";
import { useState } from "react";
import QueueRestartTaskModalContent from "./RestartTaskModal";
import QueueTimelineBullet from "./TimelineBullet";
import classes from "./Timeline.module.css";

const QueueVodTimeline = ({ queue }: Object) => {
  // modal
  const [opened, setOpened] = useState(false);
  const [restartTaskName, setRestartTaskName] = useState("");

  const restartTask = (task: string) => {
    console.log(task);
    setRestartTaskName(task);
    setOpened(true);
  };

  return (
    <div>
      <Timeline active={0} bulletSize={24} color="dark" lineWidth={3}>
        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_vod_create_folder} />}
          title="Create Folder"
        >
          <Text color="dimmed" size="sm">
            <span
              className={classes.restartText}
              onClick={() => restartTask("task_vod_create_folder")}
            >
              restart
            </span>
          </Text>
        </Timeline.Item>

        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_vod_save_info} />}
          title="Save Info"
        >
          <Text color="dimmed" size="sm">
            <span
              className={classes.restartText}
              onClick={() => restartTask("task_vod_save_info")}
            >
              restart
            </span>
          </Text>
        </Timeline.Item>

        <Timeline.Item
          bullet={
            <QueueTimelineBullet status={queue.task_vod_download_thumbnail} />
          }
          title="Download Thumbnail"
        >
          <Text color="dimmed" size="sm">
            <span
              className={classes.restartText}
              onClick={() => restartTask("task_vod_download_thumbnail")}
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

export default QueueVodTimeline;
