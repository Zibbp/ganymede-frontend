import { Button, Code, Switch, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import getConfig from "next/config";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminVodDelete = ({ handleClose, vod }) => {
  const { publicRuntimeConfig } = getConfig();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [deleteFiles, setDeleteFiles] = useState(false);

  const deleteVod = useMutation({
    mutationKey: ["delete-vod"],
    mutationFn: () => {
      setLoading(true);
      const url = deleteFiles
        ? `/api/v1/vod/${vod.id}?delete_files=true`
        : `/api/v1/vod/${vod.id}`;
      return useApi(
        {
          method: "DELETE",
          url,
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["admin-vods"]);
          setLoading(false);
          showNotification({
            title: "VOD Deleted",
            message: "VOD has been deleted successfully",
          });
          handleClose();
        })
        .catch((err) => {
          setLoading(false);
        });
    },
  });

  return (
    <div>
      <Text weight={600} size="lg">
        Are you sure you want to delete this video?
      </Text>
      <Code block mb={5}>
        <pre>ID: {vod.id}</pre>
        <pre>External ID: {vod.ext_id}</pre>
        <pre>Title: {vod.title}</pre>
      </Code>

      <img
        style={{ width: "100%" }}
        src={`${publicRuntimeConfig.CDN_URL}${vod.web_thumbnail_path}`}
      />
      <div style={{ float: "right", marginTop: "1rem" }}>
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

export default AdminVodDelete;
