import { Button, Code, Text, Switch } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminMultiVodDelete = ({ handleClose, vods }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [deleteFiles, setDeleteFiles] = useState(false);

  const deleteVod = useMutation({
    mutationKey: ["delete-vod"],
    mutationFn: async () => {
      setLoading(true);
      for await (const vod of vods) {
        console.debug("Deleting vod", vod);
        const url = deleteFiles
          ? `/api/v1/vod/${vod.id}?delete_files=true`
          : `/api/v1/vod/${vod.id}`;
        await useApi(
          {
            method: "DELETE",
            url,
            withCredentials: true,
          },
          false
        ).catch((err) => {
          console.log("Error deleting video", err);
        });
      }
      queryClient.invalidateQueries(["admin-vods"]);
      setLoading(false);
      showNotification({
        title: "Videos Deleted",
        message: "Videos have been deleted successfully",
      });
      handleClose();
    },
  });

  return (
    <div style={{ marginBottom: "2rem" }}>
      <Text weight={600} size="lg">
        Are you sure you want to delete the selected videos?
      </Text>

      <div style={{ float: "right" }}>
        <div style={{ display: "flex" }}>
          <Switch
            checked={deleteFiles}
            onChange={(event) => setDeleteFiles(event.currentTarget.checked)}
            mt={6}
            mr={10}
            labelPosition="left"
            label="Delete files"
            color="red"
          />

          <Button
            onClick={() => deleteVod.mutate()}
            color="red"
            loading={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminMultiVodDelete;
