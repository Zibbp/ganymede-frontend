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

  return (
    <div>
      <Timeline active={0} bulletSize={24} color="dark" lineWidth={3}>
        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_vod_create_folder} />}
          title="Create Folder"
        >
        </Timeline.Item>

        <Timeline.Item
          bullet={
            <QueueTimelineBullet status={queue.task_vod_download_thumbnail} />
          }
          title="Download Thumbnail"
        >
        </Timeline.Item>

        <Timeline.Item
          bullet={<QueueTimelineBullet status={queue.task_vod_save_info} />}
          title="Save Info"
        >
        </Timeline.Item>
      </Timeline>
    </div>
  );
};

export default QueueVodTimeline;
