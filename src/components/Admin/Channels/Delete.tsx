import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminChannelsDelete = ({ handleClose, channel }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteChannel = useMutation({
    mutationKey: ["delete-channel"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/channel/${channel.id}`,
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["admin-channels"]);
          setLoading(false);
          showNotification({
            title: "Channel Deleted",
            message: "Channel has been deleted successfully",
          });
          handleClose();
        })
        .catch((err) => {
          setLoading(false);
        });
    },
  });

  return (
    <div style={{ marginBottom: "2rem" }}>
      <Text weight={600} size="lg">
        Are you sure you want to delete the following channel?
      </Text>
      <div>
        Channel ID: <Code>{channel.id}</Code>
      </div>
      <div>
        Channel Name: <Code>{channel.name}</Code>
      </div>
      <div>
        <Text mt={5} size="xs">
          This action does not delete any files.
        </Text>
      </div>
      <div style={{ float: "right" }}>
        <Button
          onClick={() => deleteChannel.mutate()}
          color="red"
          loading={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AdminChannelsDelete;
