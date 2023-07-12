import { Container, createStyles, Image, Text, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import getConfig from "next/config";

const useStyles = createStyles((theme) => ({
  queueHeader: {
    height: "auto",
    paddingBottom: "10px",
    paddingTop: "10px",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },
  queueHeaderContents: {
    display: "flex",
    // Screen size
    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },
  queueHeaderTitle: {
    fontWeight: 600,
    fontSize: "24px",
  },
  queueHeaderHoverText: {
    fontWeight: 600,
    fontSize: "18px",
  },
  queueHeaderRight: {
    paddingLeft: "10px",
  },
  liveArchive: {
    fontWeight: 600,
    fontSize: "18px",
    backgroundColor: theme.colors.red[8],
    color: theme.colors.gray[0],
    padding: "2px",
    borderRadius: "4px",
    marginRight: "7px",
  },
  onHold: {
    fontWeight: 600,
    fontSize: "18px",
    backgroundColor: theme.colors.indigo[8],
    color: theme.colors.gray[0],
    padding: "2px",
    borderRadius: "4px",
    marginRight: "7px",
  },
}));

const QueueHeader = ({ queue }: Object) => {
  const { classes, cx, theme } = useStyles();
  const { publicRuntimeConfig } = getConfig();
  return (
    <div className={classes.queueHeader}>
      <Container size="2xl">
        <div className={classes.queueHeaderContents}>
          <div>
            <Image
              src={
                publicRuntimeConfig.CDN_URL + queue.edges.vod.web_thumbnail_path
              }
              width={160}
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
