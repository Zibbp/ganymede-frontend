import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminMultiVodDelete = ({ handleClose, vods }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteVod = useMutation({
    mutationKey: ["delete-vod"],
    mutationFn: async () => {
      setLoading(true);
      for await (const vod of vods) {
        console.log("Deleting vod", vod);
        await useApi(
          {
            method: "DELETE",
            url: `/api/v1/vod/${vod.id}`,
            withCredentials: true,
          },
          false
        ).catch((err) => {
          console.log("Error deleting vod", err);
        });
      }
      queryClient.invalidateQueries(["admin-vods"]);
      setLoading(false);
      showNotification({
        title: "VODs Deleted",
        message: "VODs have been deleted successfully",
      });
      handleClose();
    },
  });

  return (
    <div>
      <Text weight={600} size="lg">
        Are you sure you want to delete the selected VODs?
      </Text>

      <div>
        <Text mt={5} size="xs">
          This action does not delete any files.
        </Text>
      </div>
      <div style={{ float: "right" }}>
        <Button
          onClick={() => deleteVod.mutate()}
          color="red"
          loading={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AdminMultiVodDelete;
