import { Center, Image } from "@mantine/core";
import React from "react";

const ChannelNoVideosFound = () => {
  return (
    <div>
      <Center>
        No videos found
        <Image src="/images/Sadge.webp" ml={5} height={19} width={27} />
      </Center>
    </div>
  );
};

export default ChannelNoVideosFound;
