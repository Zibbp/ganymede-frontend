import {
  Container,
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
  Card,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconPlayerPlay, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from "../../hooks/useApi";
import classes from "./tasks.module.css"

const AdminTasksPage = () => {
  const [loading, setLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);


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

  const startWorkflow = useMutation({
    mutationFn: (workflowName: string) => {
      setWorkflowLoading(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/workflows/start`,
          data: { "workflow_name": workflowName },
          withCredentials: true,
        },
        false
      )
        .then(() => {
          setWorkflowLoading(false);
          showNotification({
            title: "Workflow Started",
            message: "Visit the Workflows page to view the status of the workflow",
          });
        })
        .catch((err) => {
          setWorkflowLoading(false);
        });
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container className={classes.settingsSections} size="xl">
          <Card withBorder p="xl" radius="md">
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
          </Card>
        </Container>
        <Container className={classes.settingsSections} size="xl">
          <Card withBorder p="xl" radius="md">
            <div className={classes.header}>
              <div>
                <Title order={2}>Workflows</Title>
              </div>
            </div>
            <Grid className={classes.taskItem}>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text>Save Chapters for Twitch Videos</Text>
                    <Text size="xs">
                      Save chapters for already archived Twitch videos.
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Workflow">
                  <ActionIcon variant="filled" size="lg" color="green" aria-label="Settings" loading={workflowLoading} onClick={() => startWorkflow.mutate("SaveTwitchVideoChapters")}>
                    <IconPlayerPlay stroke={2} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
              <Grid.Col span={10}>
                <div>
                  <span>
                    <Text>Update Live Stream Archives with VOD IDs</Text>
                    <Text size="xs">
                      Attempt to update past live stream archives with their corresponding vod ID (automatically does this after live archive finishes).
                    </Text>
                  </span>
                </div>
              </Grid.Col>
              <Grid.Col span={2}>
                <Tooltip label="Start Workflow">
                  <ActionIcon variant="filled" size="lg" color="green" aria-label="Settings" loading={workflowLoading} onClick={() => startWorkflow.mutate("UpdateTwitchLiveStreamArchivesWithVodIds")}>
                    <IconPlayerPlay stroke={2} />
                  </ActionIcon>
                </Tooltip>
              </Grid.Col>
            </Grid>
          </Card>
        </Container>
      </div>
    </Authorization >
  );
};

export default AdminTasksPage;
