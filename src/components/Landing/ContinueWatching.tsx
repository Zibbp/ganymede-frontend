import { Center, Container, Title, createStyles } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useApi } from "../../hooks/useApi";
import GanymedeLoader from "../Utils/GanymedeLoader";
import { VodCard } from "../Vod/Card";

const useStyles = createStyles((theme) => ({
  vodSection: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    // small screen wrap
    [theme.fn.smallerThan("lg")]: {
      flexDirection: "column",
    },
  },
  vodItem: {
    margin: theme.spacing.md,
    width: "640px",
    [theme.fn.smallerThan("lg")]: {
      width: "100%",
    },
  },
  title: {
    color: [theme.colorScheme === "dark" ? "white" : theme.black],
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    lineHeight: 1.05,
    maxWidth: 500,
    fontSize: 36,
    marginTop: theme.spacing.lg,

    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
      fontSize: 34,
      lineHeight: 1.15,
    },
  },
}));

const LandingContinueWatching = () => {
  const { classes } = useStyles();
  const { isLoading, error, data } = useQuery({
    queryKey: ["landing-continue-watching"],
    queryFn: async () =>
      useApi(
        {
          method: "GET",
          url: "/api/v1/playback/last?limit=4",
          withCredentials: true,
        },
        false
      ).then((res) => {
        return res?.data;
      }),
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      {data?.data?.length > 0 && (
        <div>
          <Center>
            <Title className={classes.title}>Continue Watching</Title>
          </Center>
          <Container size="2xl">
            <div className={classes.vodSection}>
              {data?.data?.map((item: any) => (
                <div className={classes.vodItem} key={item.vod.id}>
                  <VodCard vod={item.vod} playback={data?.playback}></VodCard>
                </div>
              ))}
              {[...Array(4 - data?.data?.length)].map((_, index) => (
                <div className={classes.vodItem} key={index} />
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
};

export default LandingContinueWatching;
