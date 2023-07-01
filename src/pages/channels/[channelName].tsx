import {
  Container,
  Grid,
  Pagination,
  LoadingOverlay,
  Select,
  Group,
  ActionIcon,
  NumberInput,
  NumberInputHandlers,
  Center,
  Image,
  MultiSelect,
  createStyles,
  SimpleGrid,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { ChannelHeader } from "../../components/Channel/Header";
import ChannelNoVideosFound from "../../components/Channel/NoVideosFound";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { VodCard } from "../../components/Vod/Card";
import { useApi } from "../../hooks/useApi";
import VideoCard from "../../components/Vod/Card";
import { Video } from "../../ganymede-defs";

const useStyles = createStyles((theme) => ({
  filter: {
    width: "16rem",
    marginTop: "-1rem",
    marginBottom: "1rem",
  },
}));

async function fetchVods(
  channelId: string,
  page: number,
  limit: number,
  types: string
) {
  return useApi(
    {
      method: "GET",
      url: `/api/v1/vod/paginate?limit=${limit}&offset=${
        (page - 1) * limit
      }&channel_id=${channelId}&types=${types}`,
    },
    false
  ).then((res) => res?.data);
}

const ChannelPage = (props: any) => {
  const { classes, cx, theme } = useStyles();
  const [activePage, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const handlers = useRef<NumberInputHandlers>();
  const [selected, setSelected] = useState<string[]>([]);

  const videoTypes = [
    { value: "archive", label: "Archive" },
    { value: "highlight", label: "Highlight" },
    { value: "upload", label: "Upload" },
    { value: "live", label: "Live" },
    { value: "clip", label: "Clip" },
  ];

  useDocumentTitle(`${props.channel.display_name} - Ganymede`);

  const queryClient = useQueryClient();

  // React Query
  const { isLoading, error, data } = useQuery({
    queryKey: ["channel-vods", props.channel.id, activePage, limit, selected],
    queryFn: () =>
      fetchVods(props.channel.id, activePage, limit, selected.join(",")),
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

  const setVodType = (value: string[]) => {
    setSelected(value);
    setPage(1);
  };

  if (error) return <div>failed to load</div>;

  return (
    <div>
      <div>
        <ChannelHeader channel={props.channel} />
      </div>
      <div className={classes.filter}>
        <Container size="xl" px="xl" fluid={true}>
          <MultiSelect
            data={videoTypes}
            value={selected}
            onChange={(value) => setVodType(value)}
            label="Filter by"
            placeholder="Select video types"
            clearable
          />
        </Container>
      </div>

      {isLoading || playbackDataLoading ? (
        <GanymedeLoader />
      ) : (
        <div>
          {data.data.length > 0 ? (
            <Container size="xl" px="xl" fluid={true}>
              <div>
                <SimpleGrid
                  cols={6}
                  spacing="xs"
                  verticalSpacing="xs"
                  breakpoints={[
                    { maxWidth: "80rem", cols: 4, spacing: "sm" },
                    { maxWidth: "64rem", cols: 3, spacing: "sm" },
                    { maxWidth: "48rem", cols: 2, spacing: "sm" },
                    { maxWidth: "36rem", cols: 1, spacing: "sm" },
                  ]}
                >
                  {data.data.map((video: Video) => {
                    return (
                      <VideoCard
                        key={video.id}
                        video={video}
                        playback={playbackData}
                      />
                    );
                  })}
                </SimpleGrid>
              </div>
              <Center mt={5}>
                <div>
                  <Pagination
                    value={activePage}
                    onChange={setPage}
                    total={data.pages}
                    color="violet"
                    withEdges
                  />
                  <Center mt={5} mb={20}>
                    <Group spacing={5}>
                      <ActionIcon
                        size={33}
                        variant="default"
                        onClick={() => handlers.current.decrement()}
                      >
                        –
                      </ActionIcon>

                      <NumberInput
                        hideControls
                        value={limit}
                        onChange={setLimit}
                        handlersRef={handlers}
                        max={120}
                        min={24}
                        step={24}
                        styles={{ input: { width: 54, textAlign: "center" } }}
                      />

                      <ActionIcon
                        size={33}
                        variant="default"
                        onClick={() => handlers.current.increment()}
                      >
                        +
                      </ActionIcon>
                    </Group>
                  </Center>
                </div>
              </Center>
            </Container>
          ) : (
            <ChannelNoVideosFound />
          )}
        </div>
      )}
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { channelName } = context.query;
  try {
    const response = await useApi(
      { method: "GET", url: `/api/v1/channel/name/${channelName}` },
      false
    );
    const channel = response.data;
    return {
      props: {
        channel,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true,
    };
  }
}

export default ChannelPage;
