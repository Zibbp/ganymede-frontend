import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

const AdminMultiQueueDelete = ({ handleClose, queues }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteQueue = useMutation({
    mutationKey: ["delete-queue"],
    mutationFn: async () => {
      setLoading(true);
      for await (const queue of queues) {
        await useApi(
          {
            method: "DELETE",
            url: `/api/v1/queue/${queue.id}`,
            withCredentials: true,
          },
          false
        ).catch((err) => {
          console.log("Error deleting queue", err);
        });
      }
      queryClient.invalidateQueries(["admin-queue"]);
      setLoading(false);
      showNotification({
        title: "Queue Items Deleted",
        message: "Queue items have been deleted successfully",
      });
      handleClose();
    },
  });

  return (
    <div>
      <Text weight={600} size="lg">
        Are you sure you want to delete the selected queue items?
      </Text>

      <div>
        <Text mt={5} size="xs">
          This action does not delete any files.
        </Text>
      </div>
      <div style={{ float: "right" }}>
        <Button
          onClick={() => deleteQueue.mutate()}
          color="red"
          loading={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AdminMultiQueueDelete;
