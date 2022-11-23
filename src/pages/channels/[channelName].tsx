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
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useState } from "react";
import { ChannelHeader } from "../../components/Channel/Header";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { VodCard } from "../../components/Vod/Card";
import { useApi } from "../../hooks/useApi";

async function fetchVods(channelId: string, page: number, limit: number) {
  return useApi(
    {
      method: "GET",
      url: `/api/v1/vod/paginate?limit=${limit}&offset=${
        (page - 1) * limit
      }&channel_id=${channelId}`,
    },
    false
  ).then((res) => res?.data);
}

const ChannelPage = (props: any) => {
  const [activePage, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const handlers = useRef<NumberInputHandlers>();

  useDocumentTitle(`Ganymede - ${props.channel.display_name}`);

  const queryClient = useQueryClient();

  // React Query
  const { isLoading, error, data } = useQuery({
    queryKey: ["channel-vods", props.channel.id, activePage, limit],
    queryFn: () => fetchVods(props.channel.id, activePage, limit),
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
  if (isLoading || playbackDataLoading) return <GanymedeLoader />;
  return (
    <div>
      <ChannelHeader channel={props.channel} />
      {data.data.length > 0 ? (
        <Container size="xl" px="xl" fluid={true}>
          <div>
            <Grid>
              {data.data.map((vod: any) => (
                <Grid.Col key={vod.id} md={6} lg={2} xl={2}>
                  <VodCard vod={vod} playback={playbackData}></VodCard>
                </Grid.Col>
              ))}
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
            No VODs found
            <Image src="/images/Sadge.webp" ml={5} height={28} width={28} />
          </Center>
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
