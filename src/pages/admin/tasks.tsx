import {
  Container,
  createStyles,
  Text,
  Button,
  Drawer,
  Title,
  Switch,
  TextInput,
  Code,
  Grid,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from "../../hooks/useApi";

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  right: {
    marginLeft: "auto",
    order: 2,
  },
  settingsSections: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderRadius: theme.radius.md,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
      }`,
    boxShadow: theme.shadows.sm,
  },
  taskItem: {
    display: "flex",
    marginBottom: "0.25rem",
  },
  sectionHeader: {
    marginTop: "0.3rem",
    marginBottom: "0.3rem",
  },
}));

const AdminTasksPage = () => {
  const { classes, cx, theme } = useStyles();
  const [loading, setLoading] = useState(false);

  useDocumentTitle("Ganymede - Admin - Tasks");

  const startTask = useMutation({
    mutationKey: ["task-task"],
    mutationFn: (task: string) => {
      setLoading(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/task/start`,
          data: { task },
          withCredentials: true,
        },
        false
      )
        .then(() => {
          setLoading(false);
          showNotification({
            title: "Task Started",
            message: "Check API container logs for more information",
          });
        })
        .catch((err) => {
          setLoading(false);
        });
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container className={classes.settingsSections} size="md">
          <div className={classes.header}>
            <div>
              <Title order={2}>Tasks</Title>
            </div>
          </div>
          <div>
            <div className={classes.sectionHeader}>
              <Title order={4}>Watched Channels</Title>
            </div>
            <Grid className={classes.taskItem}>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text mr={5}>Check watched channels for live streams</Text>
                    <Text italic size="xs">
                      Occurs at interval set in config.
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Task">
                  <ActionIcon
                    onClick={() => startTask.mutate("check_live")}
                    loading={loading}
                    color="green"
                    variant="filled"
                    size="lg"
                  >
                    <IconRefresh size={24} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
            </Grid>
            <Grid className={classes.taskItem}>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text mr={5}>
                      Check watched channels for new videos to archive
                    </Text>
                    <Text italic size="xs">
                      Occurs at interval set in config.
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Task">
                  <ActionIcon
                    onClick={() => startTask.mutate("check_vod")}
                    loading={loading}
                    color="green"
                    variant="filled"
                    size="lg"
                  >
                    <IconRefresh size={24} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
            </Grid>
          </div>
          {/* Queue */}
          <div>
            <div className={classes.sectionHeader}>
              <Title order={4}>Queue</Title>
            </div>
            <Grid className={classes.taskItem}>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text mr={5}>Start stuck queue items</Text>
                    <Text italic size="xs">
                      Occurs every hour.
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Task">
                  <ActionIcon
                    onClick={() => startTask.mutate("queue_hold_check")}
                    loading={loading}
                    color="green"
                    variant="filled"
                    size="lg"
                  >
                    <IconRefresh size={24} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
            </Grid>
          </div>
          {/* Ganymede */}
          <div>
            <div className={classes.sectionHeader}>
              <Title order={4}>Ganymede</Title>
            </div>
            <Grid className={classes.taskItem}>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text mr={5}>Authenticate with Twitch</Text>
                    <Text italic size="xs">
                      Occurs every 7 days.
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Task">
                  <ActionIcon
                    onClick={() => startTask.mutate("twitch_auth")}
                    loading={loading}
                    color="green"
                    variant="filled"
                    size="lg"
                  >
                    <IconRefresh size={24} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
            </Grid>
            <Grid className={classes.taskItem}>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text mr={5}>Get JWKS</Text>
                    <Text italic size="xs">
                      Occurs every day.
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Task">
                  <ActionIcon
                    onClick={() => startTask.mutate("get_jwks")}
                    loading={loading}
                    color="green"
                    variant="filled"
                    size="lg"
                  >
                    <IconRefresh size={24} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
            </Grid>
          </div>
          {/* Storage */}
          <div>
            <div className={classes.sectionHeader}>
              <Title order={4}>Storage</Title>
            </div>
            <Grid className={classes.taskItem}>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text mr={5}>Storage Template Migration</Text>
                    <Text italic size="xs">
                      Apply your current storage template to existing files.
                      Read the{" "}
                      <a
                        href="https://github.com/Zibbp/ganymede/wiki/Storage-Templates-and-Migration"
                        style={{ color: "#228be6" }}
                        target="_blank"
                      >
                        docs
                      </a>{" "}
                      before starting.
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Task">
                  <ActionIcon
                    onClick={() => startTask.mutate("storage_migration")}
                    loading={loading}
                    color="green"
                    variant="filled"
                    size="lg"
                  >
                    <IconRefresh size={24} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
            </Grid>
          </div>
          {/* Videos */}
          <div>
            <div className={classes.sectionHeader}>
              <Title order={4}>Videos</Title>
            </div>
            <Grid className={classes.taskItem}>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text mr={5}>Prune Videos</Text>
                    <Text italic size="xs">
                      Prune videos from channels that have retention settings
                      set.
                    </Text>
                    <Text italic size="xs">
                      Occurs every day at 01:00.
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Task">
                  <ActionIcon
                    onClick={() => startTask.mutate("prune_videos")}
                    loading={loading}
                    color="green"
                    variant="filled"
                    size="lg"
                  >
                    <IconRefresh size={24} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
            </Grid>
          </div>
        </Container>
      </div>
    </Authorization>
  );
};

export default AdminTasksPage;
