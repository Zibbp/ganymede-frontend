import {
  Title,
  Text,
  Button,
  Container,
  Group,
} from "@mantine/core";
import Link from "next/link";

import classes from "./Unauthorized.module.css"

export function Unauthorized() {

  return (
    <Container className={classes.root}>
      <div className={classes.label}>401</div>
      <Title className={classes.title}>Unauthorized.</Title>
      <Text
        size="lg"
        className={classes.description}
      >
        Either you are not logged in or you do not have permission to view this
        page.
      </Text>
      <Group>
        <Link href="/">
          <Button variant="subtle" size="md">
            Take me back to home page
          </Button>
        </Link>
      </Group>
    </Container>
  );
}
