import {
  createStyles,
  Container,
  Title,
  Text,
  Button,
  ActionIcon,
  Tooltip,
  rem,
} from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons";
import Link from "next/link";
import useUserStore from "../../store/user";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: "#11284b",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage:
      "linear-gradient(250deg, rgba(130, 201, 30, 0) 0%, #120643 70%), url(/images/landing-hero.webp)",
    paddingTop: rem(50),
    paddingBottom: rem(50),
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",

    [theme.fn.smallerThan("md")]: {
      flexDirection: "column",
    },
  },

  image: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  content: {
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    marginRight: theme.spacing.xl * 3,

    [theme.fn.smallerThan("md")]: {
      marginRight: 0,
    },
  },

  title: {
    color: theme.white,
    fontWeight: 900,
    lineHeight: 1.05,
    maxWidth: 500,
    fontSize: 48,

    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
      fontSize: 34,
      lineHeight: 1.15,
    },
  },

  description: {
    color: theme.white,
    opacity: 0.75,
    maxWidth: 500,

    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
    },
  },

  control: {
    paddingLeft: 50,
    paddingRight: 50,
    fontSize: 22,

    [theme.fn.smallerThan("md")]: {
      width: "100%",
    },
  },
  landingButtons: {
    display: "flex",
  },
  landingGithubIcon: {
    marginTop: "3rem",
    marginLeft: "1rem",
  },
}));

export function LandingHero() {
  const { classes } = useStyles();
  return (
    <div className={classes.root}>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              Twitch{" "}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: "orange", to: "purple" }}
              >
                Live Stream{" "}
              </Text>{" "}
              and{" "}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: "purple", to: "orange" }}
              >
                VOD{" "}
              </Text>{" "}
              archiving platform
            </Title>

            <Text className={classes.description} mt={30}>
              Seamlessly archive live streams and vods. Each archive includes a
              chat replay and rendered chat.
            </Text>

            <div className={classes.landingButtons}>
              <Link href="/channels">
                <Button
                  variant="gradient"
                  gradient={{ from: "violet", to: "indigo" }}
                  size="xl"
                  className={classes.control}
                  mt={40}
                >
                  Channels
                </Button>
              </Link>

              <div className={classes.landingGithubIcon}>
                <a href="https://github.com/zibbp/ganymede" target="_blank">
                  <Tooltip label="Github" position="top">
                    <ActionIcon size="xl" variant="transparent">
                      <IconBrandGithub size={44} />
                    </ActionIcon>
                  </Tooltip>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
