import {
  Container,
  Text,
  Button,
  Drawer,
  Title,
  Switch,
  TextInput,
  Code,
  Card,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import getConfig from "next/config";
import React, { useState } from "react";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from "../../hooks/useApi";
import classes from "./info.module.css"

const AdminInfoPage = () => {
  const { publicRuntimeConfig } = getConfig();

  useDocumentTitle("Ganymede - Admin - Info");

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-info"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/admin/info", withCredentials: true },
        false
      ).then((res) => {
        return res?.data;
      }),
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container className={classes.settingsSections} size="xl">
          <Card withBorder p="xl" radius="md">
            <div className={classes.header}>
              <div>
                <Title order={2}>Frontend</Title>
              </div>
            </div>
            <div className={classes.settingItem}>
              <Text mr={5}>Version:</Text>
              <Code>{process.env.CONFIG_BUILD_ID}</Code>
            </div>
            <div>
              <div className={classes.header}>
                <div>
                  <Title order={2}>API</Title>
                </div>
              </div>
              <div className={classes.settingItem}>
                <Text mr={5}>Commit:</Text>
                <Code>{data.commit_hash}</Code>
              </div>
              <div className={classes.settingItem}>
                <Text mr={5}>Build Date:</Text>
                <Code>{data.build_time}</Code>
              </div>
              <div className={classes.settingItem}>
                <Text mr={5}>Uptime:</Text>
                <Code>{data.uptime}</Code>
              </div>
              <div>
                <Title mt={15} order={3}>
                  Package Versions
                </Title>
                <div style={{ marginBottom: "0.25rem" }}>
                  <Text mr={5}>FFmpeg:</Text>
                  <Code block>{data.program_versions.ffmpeg}</Code>
                </div>
                <div className={classes.settingItem}>
                  <Text mr={5}>TwitchDownloader:</Text>
                  <Code>{data.program_versions.twitch_downloader}</Code>
                </div>
                <div className={classes.settingItem}>
                  <Text mr={5}>Chat Downloader:</Text>
                  <Code>{data.program_versions.chat_downloader}</Code>
                </div>
                <div className={classes.settingItem}>
                  <Text mr={5}>Streamlink:</Text>
                  <Code>{data.program_versions.streamlink}</Code>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    </Authorization>
  );
};

export default AdminInfoPage;
