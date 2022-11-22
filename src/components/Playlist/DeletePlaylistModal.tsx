import { Button, Code, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";

const DeletePlaylistModal = ({ handleClose, playlist }) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const deletePlaylist = useMutation({
    mutationKey: ["delete-playlist"],
    mutationFn: () => {
      setIsSubmitting(true);
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/playlist/${playlist.id}`,
          withCredentials: true,
        },
        false
      ).then(() => {
        setIsSubmitting(false);
        queryClient.invalidateQueries(["playlists"]);
        showNotification({
          title: "Playlist Delete",
          message: "Playlist has been deleted successfully",
        });
        handleClose();
        router.push("/playlists");
      });
    },
  });

  return (
    <div>
      <div>Are you sure you want to delete this playlist?</div>
      <div>
        Playlist ID: <Code>{playlist.id}</Code>
      </div>
      <div>
        Playlist Name: <Code>{playlist.name}</Code>
      </div>
      <Button
        onClick={() => deletePlaylist.mutate()}
        fullWidth
        radius="md"
        mt="md"
        size="md"
        color="red"
        loading={isSubmitting}
      >
        Delete
      </Button>
    </div>
  );
};

export default DeletePlaylistModal;
