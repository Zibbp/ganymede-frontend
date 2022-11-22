import { Button, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";

const EditPlaylistModal = ({ handleClose, playlist }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editPlaylist = useMutation({
    mutationKey: ["edit-playlist"],
    mutationFn: () => {
      setIsSubmitting(true);
      return useApi(
        {
          method: "PUT",
          url: `/api/v1/playlist/${playlist.id}`,
          data: { name, description },
          withCredentials: true,
        },
        false
      ).then(() => {
        setIsSubmitting(false);
        queryClient.invalidateQueries(["playlist", playlist.id]);
        showNotification({
          title: "Playlist Edited",
          message: "Playlist has been edited successfully",
        });
        handleClose();
      });
    },
  });

  return (
    <div>
      <TextInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        label="Playlist Name"
      />
      <TextInput
        mt={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        label="Playlist Description"
      />
      <Button
        onClick={() => editPlaylist.mutate()}
        fullWidth
        radius="md"
        mt="md"
        size="md"
        color="violet"
        loading={isSubmitting}
      >
        Save
      </Button>
    </div>
  );
};

export default EditPlaylistModal;
