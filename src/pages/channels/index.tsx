import axios from "axios";
import useSWR from "swr";
import { Container, Grid, LoadingOverlay, SimpleGrid } from "@mantine/core";
import { ChannelCard } from "../../components/Channel/Card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useDocumentTitle } from "@mantine/hooks";

const ChannelsPage = () => {
  const queryClient = useQueryClient();

  useDocumentTitle("Channels - Ganymede");

  // React Query
  const { isLoading, error, data } = useQuery({
    queryKey: ["channels"],
    queryFn: async () =>
      useApi({ method: "GET", url: "/api/v1/channel" }, false).then(
        (res) => res?.data
      ),
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      <Container fluid={true}>
        <div style={{ marginTop: "1rem" }}>
          <SimpleGrid cols={{ base: 1, sm: 4, md: 5, lg: 6 }} spacing="xs" verticalSpacing="xs">
            {data.map((channel: any) => (
              <ChannelCard channel={channel} key={channel.id}></ChannelCard>
            ))}
          </SimpleGrid>
          {/* <Grid>
            {data.map((channel: any) => (
              <Grid.Col key={channel.id} md={6} lg={2}>
                <ChannelCard channel={channel}></ChannelCard>
              </Grid.Col>
            ))}
          </Grid> */}
        </div>
      </Container>
    </div>
  );
};

export default ChannelsPage;
