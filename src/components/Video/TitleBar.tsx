import {
  Avatar,
  Badge,
  Divider,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCalendarEvent, IconUser, IconUsers } from "@tabler/icons-react";
import dayjs from "dayjs";
import getConfig from "next/config";
import { ROLES, useJsxAuth } from "../../hooks/useJsxAuth";
import useUserStore from "../../store/user";
import { VodMenu } from "./Menu";
import classes from "./TitleBar.module.css"

export const VodTitleBar = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);
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
            {vod.views && (
              <Group mr={15}>
                <Tooltip
                  label={`${vod.views.toLocaleString()} source views`}
                  openDelay={250}
                >
                  <div className={classes.titleBarBadge}>
                    <Text mr={3}>{vod.views.toLocaleString()}</Text>
                    <IconUsers size={20} />
                  </div>
                </Tooltip>
              </Group>
            )}
            {vod.local_views && (
              <Group mr={15}>
                <Tooltip
                  label={`${vod.local_views.toLocaleString()} local views`}
                  openDelay={250}
                >
                  <div className={classes.titleBarBadge}>
                    <Text mr={3}>{vod.local_views.toLocaleString()}</Text>
                    <IconUser size={20} />
                  </div>
                </Tooltip>
              </Group>
            )}
            <Group mr={15}>
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
            <Group>
              <Tooltip label={`Video Type`} openDelay={250}>
                <div className={classes.titleBarBadge}>
                  <Badge variant="default">
                    {vod.type}
                  </Badge>
                </div>
              </Tooltip>
            </Group>
          </div>
          {useJsxAuth({
            loggedIn: true,
            roles: [ROLES.ADMIN, ROLES.EDITOR, ROLES.ARCHIVER],
          }) && <VodMenu vod={vod} style="header" />}
        </div>
      </div>
    </div>
  );
};
