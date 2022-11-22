import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import getConfig from "next/config";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminMultiUserDelete = ({ handleClose, users }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteUser = useMutation({
    mutationKey: ["delete-user"],
    mutationFn: async () => {
      setLoading(true);
      for await (const user of users) {
        console.log("Deleting vod", user);
        await useApi(
          {
            method: "DELETE",
            url: `/api/v1/user/${user.id}`,
            withCredentials: true,
          },
          false
        ).catch((err) => {
          console.log("Error deleting user", err);
        });
      }
      queryClient.invalidateQueries(["admin-users"]);
      setLoading(false);
      showNotification({
        title: "Users Deleted",
        message: "Users have been deleted successfully",
      });
      handleClose();
    },
  });

  return (
    <div>
      <Text weight={600} size="lg">
        Are you sure you want to delete the selected Users?
      </Text>

      <div>
        <Text mt={5} size="xs">
          This action does not delete any files.
        </Text>
      </div>
      <div style={{ float: "right" }}>
        <Button
          onClick={() => deleteUser.mutate()}
          color="red"
          loading={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AdminMultiUserDelete;
