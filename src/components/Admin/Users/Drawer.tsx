import { Button, Select, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";

const AdminUserDrawer = ({ handleClose, user, mode }) => {
  const { handleSubmit } = useForm();
  const [id, setId] = useState(user?.id);
  const [username, setUsername] = useState(user?.username);
  const [role, setRole] = useState(user?.role);
  const [createdAt, setCreatedAt] = useState(user?.createdAt);
  const [loading, setLoading] = useState(false);

  const roleData = [
    { label: "Admin", value: "admin" },
    { label: "Editor", value: "editor" },
    { label: "Archiver", value: "archiver" },
    { label: "User", value: "user" },
  ];

  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation({
    mutationKey: ["create-user"],
    mutationFn: () => {
      if (mode == "edit") {
        setLoading(true);
        return useApi(
          {
            method: "PUT",
            url: `/api/v1/user/${id}`,
            data: {
              username: username,
              role: role,
            },
            withCredentials: true,
          },
          false
        )
          .then(() => {
            queryClient.invalidateQueries(["admin-users"]);
            setLoading(false);
            showNotification({
              title: "User Updated",
              message: "User has been updated successfully",
            });
            handleClose();
          })
          .catch((err) => {
            setLoading(false);
          });
      }
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit(mutate)}>
        <TextInput
          value={id}
          onChange={(e) => setId(e.currentTarget.value)}
          placeholder="Auto Generated"
          label="ID"
          disabled
          mb="xs"
        />
        <TextInput
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          placeholder="ganymede"
          label="Username"
          required
          mb="xs"
        />
        <Select
          label="Role"
          placeholder="User"
          data={roleData}
          value={role}
          onChange={setRole}
          searchable
          required
          mb="xs"
        />
        <TextInput
          value={createdAt}
          placeholder="2022/11/19"
          label="Created At"
          disabled
          mb="xs"
        />

        <Button
          type="submit"
          fullWidth
          radius="md"
          size="md"
          color="violet"
          loading={loading}
        >
          {mode == "edit" ? "Update User" : "Create User"}
        </Button>
      </form>
    </div>
  );
};

export default AdminUserDrawer;
