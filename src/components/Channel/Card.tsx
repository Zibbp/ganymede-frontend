import {
  Card,
  Image,
  Title,
  Badge,
  Button,
  Text,
  AspectRatio,
  Center,
} from "@mantine/core";
import getConfig from "next/config";
import Link from "next/link";
import { useEffect, useState } from "react";
import classes from "./Card.module.css";

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


export const ChannelCard = ({ channel, ...props }: ChannelCardProps) => {
  const { publicRuntimeConfig } = getConfig();
  const [imageLoaded, setImageLoaded] = useState(false);

  const preloadImage = (url) => {
    const image = new window.Image();
    image.src = url;
  };

  const handleImageLoaded = () => {
    setImageLoaded(true);
  };

  const imageStyle = !imageLoaded ? { display: "none" } : {};

  useEffect(() => {
    preloadImage(`${publicRuntimeConfig.CDN_URL}${channel.image_path}`);
  }, [channel.image_path]);

  return (
    <Link href={"/channels/" + channel.name}>

      <Card key={channel.id} p="md" radius="md" component="a" href="#" className={classes.card}>
        <AspectRatio ratio={300 / 300}>
          <Image src={`${publicRuntimeConfig.CDN_URL}${channel.image_path}`} alt={`${channel.name}`} />
        </AspectRatio>
        <Center mt={5}>
          <Title order={3} className={classes.title} mt={5}>
            {channel.name}
          </Title>
        </Center>
      </Card>


    </Link>
  );
};
