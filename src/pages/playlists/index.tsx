import { Button, Container, Modal, Title } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import React, { useState } from "react";
import CreatePlaylistModal from "../../components/Playlist/CreatePlaylistModal";
import PlaylistTable from "../../components/Playlist/Table";
import classes from "./playlists.module.css"

const PlaylistsPage = () => {
  const [opened, setOpened] = useState(false);

  useDocumentTitle("Playlists - Ganymede");

  const closeModalCallback = () => {
    setOpened(false);
  };
  const openModalCallback = () => {
    setOpened(true);
  }

  return (
    <div>
      <Container size="7xl">
        <div className={classes.playlistHeader}>
          <Title className={classes.playlistHeaderText}>Playlists</Title>
          <div className={classes.playlistHeaderCreate}>
            <Button
              onClick={() => setOpened(true)}
              color="violet"
              leftSection={<IconPlus size={14} />}
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
