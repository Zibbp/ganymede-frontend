import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminQueueDelete = ({ handleClose, queue }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteQueue = useMutation({
    mutationKey: ["delete-queue"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/queue/${queue.id}`,
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["admin-queue"]);
          setLoading(false);
          showNotification({
            title: "Queue Deleted",
            message: "Queue has been deleted successfully",
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
        Are you sure you want to delete the following queue?
      </Text>
      <div>
        ID: <Code>{queue.id}</Code>
      </div>
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

export default AdminQueueDelete;
