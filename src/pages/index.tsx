import { Button, Center, createStyles, Title } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import getConfig from "next/config";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { LandingHero } from "../components/Landing/Hero";
import LandingRecentlyArchived from "../components/Landing/Recent";
import styles from "../styles/Home.module.css";

const useStyles = createStyles((theme) => ({
  recentlyArchivedSection: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    marginBottom: theme.spacing.md,
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

export default function Home() {
  const { classes } = useStyles();

  useDocumentTitle("Ganymede");

  return (
    <div>
      <LandingHero />
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
