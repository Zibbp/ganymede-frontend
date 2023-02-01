import { Button, Container, createStyles, Modal } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons";
import React, { useState } from "react";
import CreatePlaylistModal from "../../components/Playlist/CreatePlaylistModal";
import PlaylistTable from "../../components/Playlist/Table";

const useStyles = createStyles((theme) => ({
  playlistHeader: { display: "flex" },
  playlistHeaderText: {
    fontSize: "24px",
    fontWeight: 600,
    marginTop: "0.25rem",
    marginBottom: "0.5rem",
  },
  playlistHeaderCreate: {
    marginLeft: "auto",
    order: 2,
    marginTop: "6px",
  },
}));

const PlaylistsPage = () => {
  const { classes, cx, theme } = useStyles();
  const [opened, setOpened] = useState(false);

  useDocumentTitle("Playlists - Ganymede");

  const closeModalCallback = () => {
    setOpened(false);
  };
  const openModalCallback = () => {
    setOpened(true);
  };

  return (
    <div>
      <Container size="2xl">
        <div className={classes.playlistHeader}>
          <div className={classes.playlistHeaderText}>Playlists</div>
          <div className={classes.playlistHeaderCreate}>
            <Button
              onClick={() => setOpened(true)}
              color="violet"
              leftIcon={<IconPlus size={14} />}
            >
              Create Playlist
            </Button>
          </div>
        </div>
        <PlaylistTable />
      </Container>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit Playlist"
      >
        <CreatePlaylistModal handleClose={closeModalCallback} />
      </Modal>
    </div>
  );
};

export default PlaylistsPage;
