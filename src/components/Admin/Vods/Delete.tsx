import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import getConfig from "next/config";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminVodDelete = ({ handleClose, vod }) => {
  const { publicRuntimeConfig } = getConfig();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteVod = useMutation({
    mutationKey: ["delete-vod"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/vod/${vod.id}`,
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
        Are you sure you want to delete the following VOD?
      </Text>
      <div>
        ID: <Code>{vod.id}</Code>
      </div>
      <div>
        Eexternal ID: <Code>{vod.ext_id}</Code>
      </div>
      <div>
        Title: <Code>{vod.title}</Code>
      </div>
      <img
        style={{ width: "100%" }}
        src={`${publicRuntimeConfig.CDN_URL}${vod.web_thumbnail_path}`}
      />
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

export default AdminVodDelete;
