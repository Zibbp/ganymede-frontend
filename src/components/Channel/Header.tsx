import { Center, Title } from "@mantine/core";
import classes from "./Header.module.css"

export const ChannelHeader = ({ channel }: any) => {
  return (
    <div className={classes.header}>
      <Center >
        <Title order={1}>{channel.display_name}</Title>
      </Center>
    </div>
  );
};
