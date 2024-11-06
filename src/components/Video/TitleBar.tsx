import {
  Avatar,
  Badge,
  Button,
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
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import Link from "next/link";



export const VodTitleBar = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const user = useUserStore((state) => state);

  const { isLoading, error, data: clipFullVideo } = useQuery({
    queryKey: ["title-bar-clip", vod.id],
    queryFn: async () =>
      vod.clip_ext_vod_id // Only run if clip_ext_vod_id is present
        ? useApi(
          { method: "GET", url: `/api/v1/vod/external_id/${vod.clip_ext_vod_id}`, withCredentials: true },
          true
        ).then((res) => res?.data)
        : null, // Return null if clip_ext_vod_id is not present
    enabled: !!vod.clip_ext_vod_id, // Disable query if clip_ext_vod_id is null or undefined
  });


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
          {clipFullVideo && (
            <Group mr={15}>
              {/* Link to vod using clip_vod_ffset - vod.duration to get the timestamp in the vod */}
              <Button variant="default" size="xs" component={Link} href={`/vods/${clipFullVideo.id}?t=${(vod.clip_vod_offset - vod.duration)}`}>Go To Full Video</Button>
            </Group>
          )}
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
