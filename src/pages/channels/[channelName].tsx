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
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { ChannelHeader } from "../../components/Channel/Header";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { VodCard } from "../../components/Vod/Card";
import { useApi } from "../../hooks/useApi";

const useStyles = createStyles((theme) => ({
  filter: {
    width: "15rem",
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

  useDocumentTitle(`Ganymede - ${props.channel.display_name}`);

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
            onChange={setSelected}
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
                <Grid>
                  {data.data.map(
                    (vod: any) =>
                      // If vod type is in selected array, render it or if selected is empty render all
                      (selected.length === 0 ||
                        selected.includes(vod.type)) && (
                        <Grid.Col key={vod.id} md={6} lg={2} xl={2}>
                          <VodCard vod={vod} playback={playbackData}></VodCard>
                        </Grid.Col>
                      )
                  )}
                </Grid>
              </div>
              <Center mt={5}>
                <div>
                  <Pagination
                    page={activePage}
                    onChange={setPage}
                    total={data.pages}
                    color="violet"
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
            <div>
              <Center>
                No videos found
                <Image src="/images/Sadge.webp" ml={5} height={19} width={27} />
              </Center>
            </div>
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
