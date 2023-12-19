import { Button, Center, Container, rem, Title } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import getConfig from "next/config";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import LandingContinueWatching from "../components/Landing/ContinueWatching";
import { LandingHero } from "../components/Landing/Hero";
import LandingRecentlyArchived from "../components/Landing/Recent";
import useUserStore from "../store/user";
import classes from "./index.module.css";
import { LandingLoggedInHero } from "../components/Landing/LoggedInHero";

export default function Home() {

  useDocumentTitle("Ganymede");

  const user = useUserStore((state) => state);

  return (
    <div>
      {user.isLoggedIn ? <LandingLoggedInHero /> : <LandingHero />}
      {user.isLoggedIn && (
        <div>
          <Center>
            <div className={classes.title}>Continue Watching</div>
          </Center>
          <Container size="7xl" >
            <LandingContinueWatching />
          </Container>
        </div>
      )}
      <Center>
        <div className={classes.title}>Recently Archived</div>
      </Center>
      <Container size="7xl" >
        <LandingRecentlyArchived />
      </Container>
    </div>
  );
}
