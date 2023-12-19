import { Title, Center, rem } from "@mantine/core";
import classes from "./LoggedInHero.module.css";


export function LandingLoggedInHero() {
  return (
    <div className={classes.root}>
      <Center>
        <Title className={classes.title}>Ganymede</Title>
      </Center>
    </div>
  );
}
