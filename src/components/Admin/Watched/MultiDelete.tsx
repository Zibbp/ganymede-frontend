import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminMultiWatchedDelete = ({ handleClose, watched }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteWatchedChannel = useMutation({
    mutationKey: ["delete-watched"],
    mutationFn: async () => {
      setLoading(true);
      for await (const watch of watched) {
        await useApi(
          {
            method: "DELETE",
            url: `/api/v1/live/${watch.id}`,
            withCredentials: true,
          },
          false
        ).catch((err) => {
          console.log("Error deleting watched channel", err);
        });
      }
      queryClient.invalidateQueries(["admin-watched"]);
      setLoading(false);
      showNotification({
        title: "Watched Channels Deleted",
        message: "Watched channels have been deleted successfully",
      });
      handleClose();
    },
  });

  return (
    <div style={{ marginBottom: "2rem" }}>
      <Text weight={600} size="lg">
        Are you sure you want to delete the selected watched channels?
      </Text>

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

export default AdminMultiWatchedDelete;
