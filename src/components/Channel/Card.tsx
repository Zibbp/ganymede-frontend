import {
  createStyles,
  Card,
  Image,
  Title,
  Badge,
  Button,
  Group,
} from "@mantine/core";
import getConfig from "next/config";
import Link from "next/link";

interface Channel {
  id: string;
  display_name: string;
  name: string;
  image_path: string;
  created_at: string;
  updated_at: string;
}

interface ChannelCardProps {
  channel: Channel;
}

const useStyles = createStyles((theme) => ({
  card: {
    transition: "transform 150ms ease, box-shadow 150ms ease",

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.05)",
    },
  },
}));

export const ChannelCard = ({ channel, ...props }: ChannelCardProps) => {
  const { publicRuntimeConfig } = getConfig();
  const { classes, theme } = useStyles();
  return (
    <Link href={"/channels/" + channel.name}>
      <Card p="md" radius="md" className={classes.card}>
        <Card.Section>
          <Image
            withPlaceholder={true}
            src={`${publicRuntimeConfig.CDN_URL}${channel.image_path}`}
            height={200}
            alt={channel.display_name}
          />
        </Card.Section>
        <Title mt="xs" order={2} align="center">
          {channel.display_name}
        </Title>
      </Card>
    </Link>
  );
};
