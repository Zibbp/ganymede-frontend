import { Container, SimpleGrid, rem, useMantineTheme } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useApi } from "../../hooks/useApi";
import GanymedeLoader from "../Utils/GanymedeLoader";
import VideoCard from "../Vod/Card";
import { useMediaQuery } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";

const LandingRecentlyArchived = () => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/vod/paginate?limit=8&offset=0" },
        false
      ).then((res) => {
        return res?.data;
      }),
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      {mobile ? (
        // use a carousel for mobile view
        <Carousel
          slideSize={{ base: '100%', sm: '50%' }}
          slideGap={{ base: rem(4), sm: 'xl' }}
          align="start"
          slidesToScroll={mobile ? 1 : 2}
          withIndicators
        >
          {data?.data?.map((vod: any) => (
            <Carousel.Slide key={vod.id}>
              <VideoCard video={vod} />
            </Carousel.Slide>
          ))}
        </Carousel>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xs" verticalSpacing="xs">
          {data?.data?.map((vod: any) => (
            <VideoCard key={vod.id} video={vod} />
          ))}
        </SimpleGrid>
      )}
    </div>

  );
};

export default LandingRecentlyArchived;
