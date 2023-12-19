import { Container, Image, Text, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import getConfig from "next/config";
import { escapeURL } from "../../util/util";
import classes from "./Header.module.css"

const QueueHeader = ({ queue }: Object) => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <div className={classes.queueHeader}>
      <Container >
        <div className={classes.queueHeaderContents}>
          <div>
            <Image
              src={
                publicRuntimeConfig.CDN_URL +
                escapeURL(queue.edges.vod.thumbnail_path)
              }
              w={160}
            />
          </div>
          <div className={classes.queueHeaderRight}>
            <div>
              <Tooltip label={queue.edges.vod.title}>
                <Text lineClamp={1} className={classes.queueHeaderTitle}>
                  {queue.edges.vod.title}
                </Text>
              </Tooltip>
            </div>
            <span>
              <span
                title="External ID"
                className={classes.queueHeaderHoverText}
              >
                {queue.edges.vod.ext_id}
              </span>
              {" - "}
              <span
                title="Ganymede ID"
                className={classes.queueHeaderHoverText}
              >
                {queue.edges.vod.id}
              </span>
            </span>
            <div>
              {queue.live_archive && (
                <span className={classes.liveArchive}>Live Archive</span>
              )}
              {queue.on_hold && <span className={classes.onHold}>On Hold</span>}
              <span
                title="Streamed At"
                className={classes.queueHeaderHoverText}
              >
                {dayjs(queue.edges.vod.streamed_at).format("YYYY/MM/DD")}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default QueueHeader;
