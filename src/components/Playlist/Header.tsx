import {
  Center,
  Text,
  Menu,
  Button,
  createStyles,
  ActionIcon,
} from "@mantine/core";
import { IconMenu2 } from "@tabler/icons";
import useUserStore from "../../store/user";

const useStyles = createStyles((theme) => ({
  playlistHeader: {
    height: "auto",
    padding: "0.5rem",
  },
  nameContainer: {
    display: "flex",
  },
  playlistMenu: {},
  headerTitle: {
    fontSize: "24px",
    fontWeight: 600,
  },
}));

const PlaylistHeader = ({ playlist, handleOpen, handleDeleteOpen }: Object) => {
  const user = useUserStore((state) => state);
  const { classes, cx, theme } = useStyles();
  return (
    <div className={classes.playlistHeader}>
      <Center>
        <div className={classes.nameContainer}>
          <Text lineClamp={1} className={classes.headerTitle}>
            {playlist.name}
          </Text>
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
