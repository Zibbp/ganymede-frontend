import {
  createStyles,
  Header,
  HoverCard,
  Group,
  Button,
  UnstyledButton,
  Text,
  SimpleGrid,
  ThemeIcon,
  Anchor,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  useMantineColorScheme,
  ActionIcon,
  TextInput,
  Image,
} from "@mantine/core";
import { MantineLogo } from "@mantine/ds";
import { useDisclosure } from "@mantine/hooks";
import {
  IconNotification,
  IconCode,
  IconBook,
  IconChartPie3,
  IconFingerprint,
  IconCoin,
  IconChevronDown,
  IconSun,
  IconMoonStars,
  IconUsers,
  IconVideo,
  IconUser,
  IconListDetails,
  IconSettings,
  IconCalendarTime,
  IconInfoCircle,
  IconSubtask,
  IconSearch,
} from "@tabler/icons";
import getConfig from "next/config";
import Link from "next/link";
import router from "next/router";
import { useState } from "react";
import { useJsxAuth } from "../../hooks/useJsxAuth";
import useUserStore from "../../store/user";
import { ROLES } from "../ProtectedRoute";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: 42,
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: -theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md}px ${theme.spacing.md * 2}px`,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
  search: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },
  rightNav: {
    position: "absolute",
    right: 0,
    marginRight: "1rem",
  },
}));

const adminLinks = [
  {
    id: "channels",
    icon: IconUsers,
    title: "Channels",
    description: "Manage and create channels",
    link: "/admin/channels",
  },
  {
    id: "vods",
    icon: IconVideo,
    title: "VODs",
    description: "Manage and create VODs",
    link: "/admin/vods",
  },
  {
    id: "user",
    icon: IconUser,
    title: "Users",
    description: "Manage users",
    link: "/admin/users",
  },
  {
    id: "queue",
    icon: IconListDetails,
    title: "Queue",
    description: "Manage queue items",
    link: "/admin/queue",
  },
  {
    id: "watched",
    icon: IconCalendarTime,
    title: "Watched Channels",
    description: "Manage watched channels",
    link: "/admin/watched",
  },
  {
    id: "settings",
    icon: IconSettings,
    title: "Settings",
    description: "Manage settings",
    link: "/admin/settings",
  },
  {
    id: "info",
    icon: IconInfoCircle,
    title: "Info",
    description: "Package versions and uptime",
    link: "/admin/info",
  },
  {
    id: "tasks",
    icon: IconSubtask,
    title: "Tasks",
    description: "Start various tasks",
    link: "/admin/tasks",
  },
];

export function HeaderMenu() {
  const { publicRuntimeConfig } = getConfig();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { classes, theme } = useStyles();
  const [search, setSearch] = useState("");

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const user = useUserStore((state) => state);

  const submitSearch = () => {
    if (search.length > 0) {
      router.push(`/search?q=${search}`);
      setSearch("");
    }
  };

  const links = adminLinks.map((item) => (
    <Link key={item.id} href={`${item.link}`}>
      <UnstyledButton className={classes.subLink}>
        <Group noWrap align="flex-start">
          <ThemeIcon size={34} variant="default" radius="md">
            <item.icon size={22} color={theme.fn.primaryColor()} />
          </ThemeIcon>
          <div>
            <Text size="sm" weight={500}>
              {item.title}
            </Text>
            <Text size="xs" color="dimmed">
              {item.description}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    </Link>
  ));

  return (
    <Box>
      <Header height={60} px="md">
        <Group sx={{ height: "100%" }}>
          <Image src={"/images/ganymede_logo.png"} height={32} width={32} />

          <Group
            sx={{ height: "100%" }}
            spacing={0}
            className={classes.hiddenMobile}
          >
            <Link href="/" className={classes.link}>
              Home
            </Link>
            <Link href="/channels" className={classes.link}>
              Channels
            </Link>
            <Link href="/playlists" className={classes.link}>
              Playlists
            </Link>
            {useJsxAuth({
              loggedIn: true,
              roles: [ROLES.EDITOR, ROLES.ARCHIVER, ROLES.ADMIN],
            }) && (
              <Link href="/archive" className={classes.link}>
                Archive
              </Link>
            )}
            {useJsxAuth({
              loggedIn: true,
              roles: [ROLES.EDITOR, ROLES.ARCHIVER, ROLES.ADMIN],
            }) && (
              <Link href="/queue" className={classes.link}>
                Queue
              </Link>
            )}
            {useJsxAuth({ loggedIn: true, roles: [] }) && (
              <Link href="/profile" className={classes.link}>
                Profile
              </Link>
            )}
            {useJsxAuth({
              loggedIn: true,
              roles: [ROLES.EDITOR, ROLES.ADMIN],
            }) && (
              <HoverCard
                width={600}
                position="bottom"
                radius="md"
                shadow="md"
                withinPortal
              >
                <HoverCard.Target>
                  <a href="#" className={classes.link}>
                    <Center inline>
                      <Box component="span" mr={5}>
                        Admin
                      </Box>
                      <IconChevronDown
                        size={16}
                        color={theme.fn.primaryColor()}
                      />
                    </Center>
                  </a>
                </HoverCard.Target>

                <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
                  <SimpleGrid cols={2} spacing={0}>
                    {links}
                  </SimpleGrid>
                </HoverCard.Dropdown>
              </HoverCard>
            )}
          </Group>

          <Group
            position="right"
            className={[classes.hiddenMobile, classes.rightNav]}
          >
            <TextInput
              className={classes.search}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  submitSearch();
                }
              }}
              placeholder="Search"
              icon={<IconSearch size={16} stroke={1.5} />}
            />
            {!user.isLoggedIn && (
              <div>
                {publicRuntimeConfig.FORCE_SSO_AUTH == "true" ? (
                  <Link
                    href={`${publicRuntimeConfig.API_URL}/api/v1/auth/oauth/login`}
                    style={{ marginRight: "0.75rem" }}
                  >
                    <Button variant="default">Log in</Button>
                  </Link>
                ) : (
                  <Link href="/login" style={{ marginRight: "0.75rem" }}>
                    <Button variant="default">Log in</Button>
                  </Link>
                )}

                <Link href="/register">
                  <Button color="violet">Sign up</Button>
                </Link>
              </div>
            )}
            <ActionIcon
              variant="outline"
              color={dark ? "yellow" : "blue"}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
            >
              {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
            </ActionIcon>
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            className={[classes.hiddenDesktop, classes.rightNav]}
          />
        </Group>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea sx={{ height: "calc(100vh - 60px)" }} mx="-md">
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Link href="/" className={classes.link}>
            Home
          </Link>
          <Link href="/channels" className={classes.link}>
            Channels
          </Link>
          <Link href="/playlists" className={classes.link}>
            Playlists
          </Link>
          {useJsxAuth({
            loggedIn: true,
            roles: [ROLES.EDITOR, ROLES.ARCHIVER, ROLES.ADMIN],
          }) && (
            <Link href="/archive" className={classes.link}>
              Archive
            </Link>
          )}
          {useJsxAuth({
            loggedIn: true,
            roles: [ROLES.EDITOR, ROLES.ARCHIVER, ROLES.ADMIN],
          }) && (
            <Link href="/queue" className={classes.link}>
              Queue
            </Link>
          )}
          {useJsxAuth({ loggedIn: true, roles: [] }) && (
            <Link href="/profile" className={classes.link}>
              Profile
            </Link>
          )}
          {useJsxAuth({
            loggedIn: true,
            roles: [ROLES.EDITOR, ROLES.ADMIN],
          }) && (
            <div>
              <UnstyledButton className={classes.link} onClick={toggleLinks}>
                <Center inline>
                  <Box component="span" mr={5}>
                    Admin
                  </Box>
                  <IconChevronDown size={16} color={theme.fn.primaryColor()} />
                </Center>
              </UnstyledButton>
              <Collapse in={linksOpened}>{links}</Collapse>
            </div>
          )}

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Group position="center" grow pb="xl" px="md">
            {!user.isLoggedIn && (
              <div>
                {publicRuntimeConfig.FORCE_SSO_AUTH == "true" ? (
                  <Link
                    href={`${publicRuntimeConfig.API_URL}/api/v1/auth/oauth/login`}
                    style={{ marginRight: "0.75rem" }}
                  >
                    <Button variant="default">Log in</Button>
                  </Link>
                ) : (
                  <Link href="/login" style={{ marginRight: "0.75rem" }}>
                    <Button variant="default">Log in</Button>
                  </Link>
                )}

                <Link href="/register">
                  <Button color="violet">Sign up</Button>
                </Link>
              </div>
            )}
            <ActionIcon
              variant="outline"
              color={dark ? "yellow" : "blue"}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
            >
              {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
            </ActionIcon>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
