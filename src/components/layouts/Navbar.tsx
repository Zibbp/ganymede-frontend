import {
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
  rem,
  useMantineTheme,
  TextInput,
  useMantineColorScheme,
  ActionIcon,
  useComputedColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconNotification,
  IconCode,
  IconBook,
  IconChartPie3,
  IconFingerprint,
  IconCoin,
  IconChevronDown,
  IconUsers,
  IconVideo,
  IconUser,
  IconListDetails,
  IconCalendarTime,
  IconSettings,
  IconInfoCircle,
  IconSubtask,
  IconSearch,
  IconSun,
  IconMoon,
  IconBarrierBlock,
} from '@tabler/icons-react';
import classes from './Navbar.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { ROLES, useJsxAuth } from '../../hooks/useJsxAuth';
import getConfig from 'next/config';
import useUserStore from '../../store/user';
import router from 'next/router';
import { useState } from 'react';
import cx from "clsx"

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
    id: "blocked_vods",
    icon: IconBarrierBlock,
    title: "Blocked VODs",
    description: "Manage blocked VODs",
    link: "/admin/blocked-vods",
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

export function HeaderMegaMenu() {
  const { publicRuntimeConfig } = getConfig();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const [search, setSearch] = useState("");
  const theme = useMantineTheme();
  // const { setColorScheme, clearColorScheme } = useMantineColorScheme();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  const user = useUserStore((state) => state);

  const submitSearch = () => {
    if (search.length > 0) {
      router.push(`/search?q=${search}`);
      setSearch("");
    }
  }

  const links = adminLinks.map((item) => (
    <Link key={item.id} href={`${item.link}`}>
      <UnstyledButton className={classes.subLink} key={item.title}>
        <Group wrap="nowrap" align="flex-start">
          <ThemeIcon size={34} variant="default" radius="md">
            <item.icon style={{ width: rem(22), height: rem(22) }} color={theme.colors.blue[6]} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500}>
              {item.title}
            </Text>
            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    </Link>
  ));

  return (
    <Box>
      <header className={classes.header}>
        <Group h="100%">
          <Image src="/images/ganymede_logo.png" height={32} width={32} alt="Ganymede logo" />
          <Group h="100%" gap={0} visibleFrom="sm">

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
                <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
                  <HoverCard.Target>
                    <a href="#" className={classes.link}>
                      <Center inline>
                        <Box component="span" mr={5}>
                          Admin
                        </Box>
                        <IconChevronDown
                          style={{ width: rem(16), height: rem(16) }}
                          color={theme.colors.blue[6]}
                        />
                      </Center>
                    </a>
                  </HoverCard.Target>

                  <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                    <SimpleGrid cols={2} spacing={0}>
                      {links}
                    </SimpleGrid>
                  </HoverCard.Dropdown>
                </HoverCard>
              )}

          </Group>

          <Group visibleFrom="md" className={classes.groupRight}>
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
              leftSection={<IconSearch size={16} stroke={1.5} />}
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
              onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
              <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
            </ActionIcon>
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

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
              <Link href="/workflows" className={classes.link}>
                Workflows
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
                    <IconChevronDown
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.blue[6]}
                    />
                  </Center>
                </UnstyledButton>
                <Collapse in={linksOpened}>{links}</Collapse>
              </div>
            )}

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
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
              leftSection={<IconSearch size={16} stroke={1.5} />}
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
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}