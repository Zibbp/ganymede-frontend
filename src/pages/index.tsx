import { Button, Center, createStyles, rem, Title } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import getConfig from "next/config";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import LandingContinueWatching from "../components/Landing/ContinueWatching";
import { LandingHero } from "../components/Landing/Hero";
import LandingRecentlyArchived from "../components/Landing/Recent";
import useUserStore from "../store/user";
import styles from "../styles/Home.module.css";
import { LandingLoggedInHero } from "../components/Landing/LoggedInHero";

const useStyles = createStyles((theme) => ({
  recentlyArchivedSection: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
  continueWatchingSection: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    marginBottom: rem(-20),
  },
  title: {
    color: [theme.colorScheme === "dark" ? "white" : theme.black],
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    lineHeight: 1.05,
    maxWidth: 500,
    fontSize: 36,
    marginTop: rem(15),
    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
      fontSize: 34,
      lineHeight: 1.15,
    },
  },
}));

export default function Home() {
  const { classes } = useStyles();

  useDocumentTitle("Ganymede");

  const user = useUserStore((state) => state);

  return (
    <div>
      {user.isLoggedIn ? <LandingLoggedInHero /> : <LandingHero />}
      {user.isLoggedIn && (
        <div className={classes.continueWatchingSection}>
          <Center>
            <LandingContinueWatching />
          </Center>
        </div>
      )}
      <div className={classes.recentlyArchivedSection}>
        <Center>
          <Title className={classes.title}>Recently Archived</Title>
        </Center>
        <Center>
          <LandingRecentlyArchived />
        </Center>
      </div>
    </div>
  );
}
