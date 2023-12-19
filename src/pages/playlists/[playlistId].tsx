import { Center, Container, Grid, SimpleGrid, Modal } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useState } from "react";
import ChannelNoVideosFound from "../../components/Channel/NoVideosFound";
import DeletePlaylistModal from "../../components/Playlist/DeletePlaylistModal";
import EditPlaylistModal from "../../components/Playlist/EditPlaylistModal";
import PlaylistHeader from "../../components/Playlist/Header";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import VideoCard from "../../components/Vod/Card";
import { useApi } from "../../hooks/useApi";

const PlaylistPage = (props: any) => {
  const [opened, setOpened] = useState(false);
  const [deletePlaylistModalOpened, setDeletePlaylistModalOpened] =
    useState(false);

  useDocumentTitle(`Ganymede - Playlist ${props.playlistId}`);

  const { isLoading, error, data } = useQuery({
    queryKey: ["playlist", props.playlistId],
    queryFn: () =>
      useApi(
        {
          method: "GET",
          url: `/api/v1/playlist/${props.playlistId}`,
        },
        false
      ).then((res) => res?.data),
  });

  const { data: playbackData, isLoading: playbackDataLoading } = useQuery({
    queryKey: ["playback-data"],
    queryFn: async () => {
      return useApi(
        {
          method: "GET",
          url: "/api/v1/playback",
          withCredentials: true,
        },
        true
      ).then((res) => res?.data);
    },
  });

  const closeModalCallback = () => {
    setOpened(false);
  };
  const openModalCallback = () => {
    setOpened(true);
  };
  const closeDeletePlaylistModalCallback = () => {
    setDeletePlaylistModalOpened(false);
  };
  const openDeletePlaylistModalCallback = () => {
    setDeletePlaylistModalOpened(true);
  };

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      <Head>
        <title>{data.name} - Ganymede Playlist</title>
      </Head>
      <PlaylistHeader
        playlist={data}
        handleOpen={openModalCallback}
        handleDeleteOpen={openDeletePlaylistModalCallback}
      />

      {isLoading || playbackDataLoading ? (
        <GanymedeLoader />
      ) : data.edges.vods ? (
        <Container mt={5} size="xl" px="xl" fluid={true}>
          <div>
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}
              spacing="xs"
              verticalSpacing="xs"
            >
              {data.edges.vods.map((vod: any) => (

                <VideoCard video={vod} playback={playbackData}></VideoCard>

              ))}
            </SimpleGrid>
          </div>
        </Container>
      ) : (
        <ChannelNoVideosFound />
      )}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit Playlist"
      >
        <EditPlaylistModal handleClose={closeModalCallback} playlist={data} />
      </Modal>
      <Modal
        opened={deletePlaylistModalOpened}
        onClose={() => setDeletePlaylistModalOpened(false)}
        title="Delete Playlist"
      >
        <DeletePlaylistModal
          handleClose={closeDeletePlaylistModalCallback}
          playlist={data}
        />
      </Modal>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { playlistId } = context.query;
  return {
    props: {
      playlistId,
    },
  };
}

export default PlaylistPage;
