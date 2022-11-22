import {
  Avatar,
  createStyles,
  Divider,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCalendarEvent, IconUsers } from "@tabler/icons";
import dayjs from "dayjs";
import getConfig from "next/config";
import { ROLES, useJsxAuth } from "../../hooks/useJsxAuth";
import useUserStore from "../../store/user";
import { VodMenu } from "./Menu";

const useStyles = createStyles((theme) => ({
  titleBarContainer: {
    width: "100%",
    height: "60px",
    position: "relative",
  },
  titleBar: {
    display: "flex",
    position: "absolute",
    margin: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "100%",
    paddingLeft: "10px",
    paddingRight: "10px",
  },
  titleBarRight: {
    marginLeft: "auto",
    float: "right",
    display: "flex",
  },
  titleBarBadge: {
    display: "flex",
    alignItems: "center",
    marginRight: "5px",
  },
}));

export const VodTitleBar = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);
  const { classes, cx, theme } = useStyles();
  return (
    <div className={classes.titleBarContainer}>
      <div className={classes.titleBar}>
        <Avatar
          src={`${publicRuntimeConfig.CDN_URL}${vod.edges.channel.image_path}`}
          radius="xl"
          alt={vod.edges.display_name}
          mr={10}
          mt={3}
        />
        <Divider size="sm" orientation="vertical" mr={10} />
        <div style={{ width: "60%" }}>
          <Tooltip label={vod.title} openDelay={250}>
            <Text size="xl" lineClamp={1} pt={3}>
              {vod.title}
            </Text>
          </Tooltip>
        </div>
        <div className={classes.titleBarRight}>
          <div className={classes.titleBarBadge}>
            <Group mr={15}>
              <Tooltip
                label={`${vod.views.toLocaleString()} views`}
                openDelay={250}
              >
                <div className={classes.titleBarBadge}>
                  <Text mr={3}>{vod.views.toLocaleString()}</Text>
                  <IconUsers size={20} />
                </div>
              </Tooltip>
            </Group>
            <Group>
              <Tooltip
                label={`Originally streamed at ${vod.streamed_at}`}
                openDelay={250}
              >
                <div className={classes.titleBarBadge}>
                  <Text mr={5}>
                    {dayjs(vod.streamed_at).format("YYYY/MM/DD")}
                  </Text>
                  <IconCalendarEvent size={20} />
                </div>
              </Tooltip>
            </Group>
          </div>
          {useJsxAuth({
            loggedIn: true,
            roles: [ROLES.ADMIN, ROLES.EDITOR, ROLES.ARCHIVER],
          }) && <VodMenu vod={vod} />}
        </div>
      </div>
    </div>
  );
};
