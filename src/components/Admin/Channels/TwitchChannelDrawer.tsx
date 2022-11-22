import { Button, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";

const AdminChannelTwitchChannelDrawer = ({ handleClose }) => {
  const { handleSubmit } = useForm();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation({
    mutationKey: ["create-channel"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/archive/channel`,
          data: {
            channel_name: name,
          },
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["admin-channels"]);
          setLoading(false);
          showNotification({
            title: "Channel Created",
            message: "Channel has been created successfully",
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
      <form onSubmit={handleSubmit(mutate)}>
        <TextInput
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Name"
          label="Name"
          required
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
          Add
        </Button>
      </form>
    </div>
  );
};

export default AdminChannelTwitchChannelDrawer;
