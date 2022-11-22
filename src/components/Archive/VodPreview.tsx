import { TwitchVODResponse } from "../../pages/archive";
import { Image, Title } from "@mantine/core";

export const VodPreview = ({ vod }: TwitchVODResponse) => {
  const thumbnailUrl = vod.thumbnail_url
    .replace("%{width}", "640")
    .replace("%{height}", "360");
  return (
    <div style={{ marginTop: "1rem" }}>
      <div>
        <Image src={thumbnailUrl} radius="sm" />
        <Title mt={5} order={4}>
          {vod.title}
        </Title>
        <div>
          <div>
            <span>Created At: </span>
            {vod.created_at}
          </div>
          <div>
            <span>Duration: </span>
            {vod.duration}
          </div>
          <div>
            <span>Views: </span>
            {vod.view_count}
          </div>
        </div>
      </div>
    </div>
  );
};
