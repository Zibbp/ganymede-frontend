import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminWatchedDelete = ({ handleClose, watched }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteWatchedChannel = useMutation({
    mutationKey: ["delete-watched"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/live/${watched.id}`,
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["admin-watched"]);
          setLoading(false);
          showNotification({
            title: "Watched Channel Deleted",
            message: "Watched Channel has been deleted successfully",
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
        Are you sure you want to delete the following watched channel?
      </Text>
      <div>
        ID: <Code>{watched.id}</Code>
      </div>
      <div>
        Channel: <Code>{watched.edges.channel.display_name}</Code>
      </div>
      <div>
        <Text mt={5} size="xs">
          This action does not delete any files.
        </Text>
      </div>
      <div style={{ float: "right" }}>
        <Button
          onClick={() => deleteWatchedChannel.mutate()}
          color="red"
          loading={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AdminWatchedDelete;
