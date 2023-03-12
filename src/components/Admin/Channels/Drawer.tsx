import { Button, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";

const AdminChannelDrawer = ({ handleClose, channel, mode }) => {
  const { handleSubmit } = useForm();
  const [id, setId] = useState(channel?.id);
  const [name, setName] = useState(channel?.name);
  const [displayName, setDisplayName] = useState(channel?.display_name);
  const [imagePath, setImagePath] = useState(channel?.image_path);
  const [loading, setLoading] = useState(false);
  const [updateImageLoading, setUpdateImageLoading] = useState(false);

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
              name: name,
              display_name: displayName,
              image_path: imagePath,
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

        <Button
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
