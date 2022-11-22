import { Timeline, Text, Modal, createStyles } from "@mantine/core";
import {
  IconGitBranch,
  IconGitPullRequest,
  IconGitCommit,
  IconMessageDots,
} from "@tabler/icons";
import { useState } from "react";
import QueueRestartTaskModalContent from "./RestartTaskModal";
import QueueTimelineBullet from "./TimelineBullet";

const useStyles = createStyles((theme) => ({
  restartText: {
    cursor: "pointer",
  },
}));

const QueueVodTimeline = ({ queue }: Object) => {
  const { classes, cx, theme } = useStyles();
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
              onClick={() => restartTask("vod_create_folder")}
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
              onClick={() => restartTask("vod_download_thumbnail")}
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
              onClick={() => restartTask("vod_save_info")}
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

export default QueueVodTimeline;
