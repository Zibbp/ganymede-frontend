import { Button, Code, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

const AdminUserDelete = ({ handleClose, user }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const deleteUser = useMutation({
    mutationKey: ["delete-user"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/user/${user.id}`,
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["admin-users"]);
          setLoading(false);
          showNotification({
            title: "User Deleted",
            message: "User has been deleted successfully",
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
        Are you sure you want to delete the following user?
      </Text>
      <div>
        ID: <Code>{user.id}</Code>
      </div>
      <div>
        Username: <Code>{user.username}</Code>
      </div>
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

export default AdminUserDelete;
