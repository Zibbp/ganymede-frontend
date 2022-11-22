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
        Id: <Code>{vod.id}</Code>
      </div>
      <div>
        External Id: <Code>{vod.ext_id}</Code>
      </div>
      <div>
        Platform: <Code>{vod.platform}</Code>
      </div>
      <div>
        Type: <Code>{vod.type}</Code>
      </div>
      <div>
        Duration: <Code>{vod.duration}</Code>
      </div>
      <div>
        Views: <Code>{vod.views}</Code>
      </div>
      <div>
        Resolution: <Code>{vod.resolution}</Code>
      </div>
      <div>
        Thumbnail Path: <Code>{vod.thumbnail_path}</Code>
      </div>
      <div>
        Web Thumbnail Path: <Code>{vod.web_thumbnail_path}</Code>
      </div>
      <div>
        Video Path: <Code>{vod.video_path}</Code>
      </div>
      <div>
        Chat Path: <Code>{vod.chat_path}</Code>
      </div>
      <div>
        Chat Video Path: <Code>{vod.chat_video_path}</Code>
      </div>
      <div>
        Info Path: <Code>{vod.info_path}</Code>
      </div>
      <div>
        Streamed At: <Code>{vod.streamed_at}</Code>
      </div>
      <div>
        Created/Archived At: <Code>{vod.created_at}</Code>
      </div>
      <div>
        Channel: <Code>{vod.edges.channel.name}</Code>
      </div>
      <div>
        Channel Id: <Code>{vod.edges.channel.id}</Code>
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
