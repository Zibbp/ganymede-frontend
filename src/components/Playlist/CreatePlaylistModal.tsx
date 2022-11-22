import { Button, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";

const CreatePlaylistModal = ({ handleClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editPlaylist = useMutation({
    mutationKey: ["create-playlist"],
    mutationFn: () => {
      if (!name || !description) {
        return;
      }
      setIsSubmitting(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/playlist`,
          data: { name, description },
          withCredentials: true,
        },
        false
      )
        .then(() => {
          setIsSubmitting(false);
          queryClient.invalidateQueries(["playlists"]);
          showNotification({
            title: "Playlist Created",
            message: "Playlist has been created successfully",
          });
          handleClose();
        })
        .catch((err) => {
          setIsSubmitting(false);
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
        Create
      </Button>
    </div>
  );
};

export default CreatePlaylistModal;
