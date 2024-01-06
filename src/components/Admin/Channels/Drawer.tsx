import {
  Button,
  Text,
  NumberInput,
  Switch,
  TextInput,
  ActionIcon,
  Tooltip,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";
import { IconHelpCircle, IconQuestionMark } from "@tabler/icons-react";

const AdminChannelDrawer = ({ handleClose, channel, mode }) => {
  const { handleSubmit } = useForm();
  const [id, setId] = useState(channel?.id);
  const [externalId, setExternalId] = useState(channel?.external_id);
  const [name, setName] = useState(channel?.name);
  const [displayName, setDisplayName] = useState(channel?.display_name);
  const [imagePath, setImagePath] = useState(channel?.image_path);
  const [loading, setLoading] = useState(false);
  const [updateImageLoading, setUpdateImageLoading] = useState(false);
  const [retentionEnabled, setRetentionEnabled] = useState(channel?.retention);
  const [retentionDays, setRetentionDays] = useState(
    channel?.retention_days || 7
  );

  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation({
    mutationKey: ["create-channel"],
    mutationFn: () => {
      if (mode == "edit") {
        setLoading(true);
        return useApi(
          {
            method: "PUT",
            url: `/api/v1/channel/${id}`,
            data: {
              name: name,
              display_name: displayName,
              image_path: imagePath,
              retention: retentionEnabled,
              retention_days: retentionDays,
            },
            withCredentials: true,
          },
          false
        )
          .then(() => {
            queryClient.invalidateQueries(["admin-channels"]);
            setLoading(false);
            showNotification({
              title: "Channel Updated",
              message: "Channel has been updated successfully",
            });
            handleClose();
          })
          .catch((err) => {
            setLoading(false);
          });
      }
      if (mode == "create") {
        setLoading(true);
        return useApi(
          {
            method: "POST",
            url: `/api/v1/channel`,
            data: {
              ext_id: externalId,
              name: name,
              display_name: displayName,
              image_path: imagePath,
              retention: retentionEnabled,
              retention_days: retentionDays,
            },
            withCredentials: true,
          },
          false
        )
          .then(() => {
            queryClient.invalidateQueries(["admin-channels"]);
            setLoading(false);
            showNotification({
              title: "Channel Created",
              message: "Channel has been created successfully",
            });
            handleClose();
          })
          .catch((err) => {
            setLoading(false);
          });
      }
    },
  });

  const updateChannelImage = useMutation({
    mutationKey: ["update-channel-image"],
    mutationFn: (id: string) => {
      setUpdateImageLoading(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/channel/update-image?id=${id}`,
          withCredentials: true,
        },
        false
      )
        .then(() => {
          setUpdateImageLoading(false);
          showNotification({
            title: "Channel Updated",
            message: "Channel image has been updated successfully",
          });
          handleClose();
        })
        .catch((err) => {
          setUpdateImageLoading(false);
        });
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit(mutate)}>
        <TextInput
          value={id}
          onChange={(e) => setId(e.currentTarget.value)}
          placeholder="Auto Generated"
          label="ID"
          disabled
          mb="xs"
        />
        {mode == "create" && (
          <TextInput
            value={externalId}
            onChange={(e) => setExternalId(e.currentTarget.value)}
            placeholder="External ID (auto generated if left blank)"
            label="External ID"
            mb="xs"
          />
        )}
        <TextInput
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Login Name"
          label="Name"
          required
          mb="xs"
        />
        <TextInput
          value={displayName}
          onChange={(e) => setDisplayName(e.currentTarget.value)}
          placeholder="Display Name"
          label="Display Name"
          required
          mb="xs"
        />
        <TextInput
          value={imagePath}
          onChange={(e) => setImagePath(e.currentTarget.value)}
          placeholder="Image Path"
          label="Image Path"
          required
          mb="xs"
        />

        <div style={{ display: "flex" }}>
          <Text>Retention settings</Text>
          <Tooltip
            multiline
            width={400}
            label="If this setting is enabled, channel videos will be deleted (including files) after a
          certain amount of time. 'Lock' a video to prevent it from being
          deleted."
          >
            <ActionIcon variant="transparent">
              <IconHelpCircle size="1.125rem" />
            </ActionIcon>
          </Tooltip>
        </div>

        <Switch
          label="Enable retention"
          checked={retentionEnabled}
          onChange={(event) => setRetentionEnabled(event.currentTarget.checked)}
          color="violet"
        />
        {retentionEnabled && (
          <Text c="red" mt={5}>
            Videos will be deleted after {retentionDays} days
          </Text>
        )}
        {retentionEnabled && (
          <NumberInput
            defaultValue={7}
            placeholder="Retention Days"
            label="Retention Days"
            value={retentionDays}
            onChange={setRetentionDays}
          />
        )}

        <Button
          mt={10}
          fullWidth
          radius="md"
          size="xs"
          color="gray"
          variant="outline"
          mb="sm"
          loading={updateImageLoading}
          onClick={() => updateChannelImage.mutate(id)}
        >
          Update Channel Image
        </Button>

        <Button
          type="submit"
          fullWidth
          radius="md"
          size="md"
          color="violet"
          loading={loading}
        >
          {mode == "edit" ? "Update Channel" : "Create Channel"}
        </Button>
      </form>
    </div>
  );
};

export default AdminChannelDrawer;
