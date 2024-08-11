import { PlatformVideoInfo } from "../../ganymede-defs";
import { Image, Title } from "@mantine/core";

export const VodPreview = ({ video }: { video: PlatformVideoInfo }) => {
  console.log(video)
  const thumbnailUrl = video.thumbnail_url
    .replace("%{width}", "640")
    .replace("%{height}", "360");
  return (
    <div style={{ marginTop: "1rem" }}>
      <div>
        <Image src={thumbnailUrl} radius="sm" />
        <Title mt={5} order={4}>
          {video.title}
        </Title>
        <div>
          <div>
            <span>Created At: </span>
            {video.created_at}
          </div>
          <div>
            <span>Duration: </span>
            {video.duration}
          </div>
          <div>
            <span>Views: </span>
            {video.view_count}
          </div>
          {video.chapters && (
            <div>
              <span>Chapters: </span>
              {video.chapters.length}
            </div>
          )}
          {video.muted_segments && (
            <div>
              <span>Muted Segments: </span>
              {video.muted_segments.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
