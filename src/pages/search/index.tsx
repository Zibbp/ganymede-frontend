import {
  ActionIcon,
  Center,
  Container,
  Grid,
  Group,
  NumberInput,
  NumberInputHandlers,
  Pagination,
  TextInput,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import ChannelNoVideosFound from "../../components/Channel/NoVideosFound";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from "../../hooks/useApi";
import VideoCard from "../../components/Vod/Card";

interface SearchPageProps {
  q: string;
}

const SearchPage = (props: SearchPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const handlers = useRef<NumberInputHandlers>();

  useDocumentTitle("Ganymede - Search");

  useEffect(() => {
    if (props.q && props.q.length > 0) {
      setDisplaySearchTerm(props.q);
      setSearchTerm(props.q);
    }
  }, []);

  const { isLoading, error, data } = useQuery({
    queryKey: ["search", searchTerm, page, limit],
    queryFn: () => {
      if (searchTerm != "") {
        return useApi(
          {
            method: "GET",
            url: `/api/v1/vod/search?q=${searchTerm}&limit=${limit}&offset=${
              (page - 1) * limit
            }`,
          },
          false
        ).then((res) => {
          return res?.data;
        });
      }
    },
  });

  const { data: playbackData } = useQuery({
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

  return (
    <div>
      <Container size="xl" px="xl" fluid={true}>
        <Center mt={10}>
          <TextInput
            placeholder="Search"
            value={displaySearchTerm}
            onChange={(e) => setDisplaySearchTerm(e.currentTarget.value)}
            style={{ width: "35%" }}
            icon={<IconSearch size={16} stroke={1.5} />}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                setSearchTerm(displaySearchTerm);
              }
            }}
          />
        </Center>

        {isLoading && <GanymedeLoader />}
        {!isLoading && data && data.data.length > 0 ? (
          <div>
            <div>
              <Grid mt={10}>
                {data.data.map((vod: any) => (
                  <Grid.Col key={vod.id} md={6} lg={2} xl={2}>
                    <VideoCard
                      video={vod}
                      playback={playbackData}
                      showChannel={true}
                    ></VideoCard>
                  </Grid.Col>
                ))}
              </Grid>
            </div>
            <Center mt={5}>
              <div>
                <Pagination
                  page={page}
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
          </div>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <ChannelNoVideosFound />
          </div>
        )}
      </Container>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { q } = context.query;
  return {
    props: {
      q: q || null,
    },
  };
}

export default SearchPage;
