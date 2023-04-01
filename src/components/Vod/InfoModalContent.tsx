import { Code, Loader, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";

async function fetchVideoInfo(videoPath: string) {
  return useApi(
    {
      method: "POST",
      url: "/api/v1/exec/ffprobe",
      data: { path: videoPath },
      withCredentials: true,
    },
    false
  );
}

export const VodInfoModalContent = ({ vod }: any) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["video-info", vod.video_path],
    queryFn: () => fetchVideoInfo(vod.video_path),
  });

  return (
    <div>
      <div>
        <Code block>{JSON.stringify(vod, null, 2)}</Code>
      </div>
      <div>
        <Text mt={15} size="lg" weight={500}>
          Video FFprobe
        </Text>
        {error && <div>failed to load</div>}
        {isLoading && <Loader />}
        {data && <Code block>{JSON.stringify(data.data, null, 2)}</Code>}
      </div>
    </div>
  );
};
