import {
  Center,
  Text,
  Menu,
  Button,
  ActionIcon,
  Title,
} from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import useUserStore from "../../store/user";
import classes from "./Header.module.css"

const PlaylistHeader = ({ playlist, handleOpen, handleDeleteOpen }: any) => {
  const user = useUserStore((state) => state);
  return (
    <div className={classes.playlistHeader}>
      <Center>
        <div className={classes.nameContainer}>
          <Title>
            {playlist.name}
          </Title>
        </div>
      </Center>
      <Center>
        <Text lineClamp={1}>{playlist.description}</Text>
      </Center>
      {(user.role == "admin" || user.role == "editor") && (
        <Center>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconMenu2 size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Settings</Menu.Label>
              <Menu.Item component="a" href={`/playlists/multistream/${playlist.id}`}>Multistream</Menu.Item>
              <Menu.Item onClick={() => handleOpen()}>Edit</Menu.Item>
              <Menu.Item onClick={() => handleDeleteOpen()} color="red">
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Center>
      )}
    </div>
  );
};

export default PlaylistHeader;
